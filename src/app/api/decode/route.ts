import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrescriptionDecodeResult } from '@/types/prescription';

const SYSTEM_PROMPT = `
You are an expert medical prescription decoder for the Bangladeshi healthcare market.

Follow these TWO PASSES strictly:

━━━ PASS 1: OCR & STRUCTURED PARSING ━━━
1. Read the prescription image or PDF document using OCR.
2. Identify every medicine, its dosage, frequency, and duration.
3. Translate ALL Bengali text and medical shorthand into English:
   - Bengali numerals (১২৩) → Arabic numerals (123)
   - "খাওয়ার পর" → "After meal", "খাওয়ার আগে" → "Before meal"
   - "১-০-১" → frequencyPerDay: 2, "১-১-১" → frequencyPerDay: 3, "০-০-১" → frequencyPerDay: 1
   - "BD" → 2 times/day, "TDS" → 3 times/day, "QID" → 4 times/day, "OD" → 1 time/day, "SOS" → as needed
4. For each medicine, determine unit type: "tablet", "capsule", "syrup", "drop", "inhaler", "injection", or "other"

━━━ PASS 2: SEARCH & PHARMA GROUNDING ━━━
5. Provide current Bangladeshi BDT pricing (Medex.com.bd context) and 3 alternative brands available in Bangladesh:
   - index 0 & 1: best equivalent match (type: "best")
   - index 2: cheaper option of same generic (type: "cheaper")

━━━ REQUIRED OUTPUT JSON SCHEMA ━━━
You MUST return ONLY a valid JSON object matching this schema. No markdown wrappers around the JSON.

{
  "doctorInfo": {
    "name": "string or null",
    "specialization": "string or null",
    "chamber": "string or null",
    "date": "string or null"
  },
  "patientInfo": {
    "name": "string or null",
    "age": "string or null",
    "gender": "string or null"
  },
  "medicines": [
    {
      "brandName": "string",
      "genericName": "string or null",
      "manufacturer": "string or null",
      "unit": "tablet | capsule | syrup | drop | inhaler | injection | other",
      "dosage": "string",
      "tabletsPerDose": number or null,
      "frequency": "string",
      "frequencyPerDay": number or null,
      "duration": "string",
      "durationDays": number or null,
      "unitPrice": "string or null",
      "unitPriceValue": number or null,
      "stripPrice": "string or null",
      "stripPriceValue": number or null,
      "tabletsPerStrip": number or null,
      "sideEffects": ["string"],
      "doctorNotes": "string or null",
      "alternatives": [
        {
          "brandName": "string or null",
          "genericName": "string or null",
          "manufacturer": "string or null",
          "unitPrice": "string or null",
          "unitPriceValue": number or null,
          "stripPrice": "string or null",
          "stripPriceValue": number or null,
          "tabletsPerStrip": number or null,
          "type": "best"
        },
        {
          "brandName": "string or null",
          "genericName": "string or null",
          "manufacturer": "string or null",
          "unitPrice": "string or null",
          "unitPriceValue": number or null,
          "stripPrice": "string or null",
          "stripPriceValue": number or null,
          "tabletsPerStrip": number or null,
          "type": "best"
        },
        {
          "brandName": "string or null",
          "genericName": "string or null",
          "manufacturer": "string or null",
          "unitPrice": "string or null",
          "unitPriceValue": number or null,
          "stripPrice": "string or null",
          "stripPriceValue": number or null,
          "tabletsPerStrip": number or null,
          "type": "cheaper"
        }
      ]
    }
  ],
  "generalInstructions": "string or null"
}
`;

const FLASH_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
];

async function generateWithSmartFlashChain(
  genAI: GoogleGenerativeAI,
  contents: any[]
): Promise<{ text: string; modelUsed: string }> {
  const envModel = process.env.GEMINI_MODEL;
  
  const candidateQueue = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    ...(envModel ? [envModel] : []),
    ...FLASH_MODELS,
  ];
  const uniqueModels = Array.from(new Set(candidateQueue));

  let lastError: any = null;

  for (const modelName of uniqueModels) {
    const maxAttempts = modelName === 'gemini-3.6-flash' ? 3 : 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Decode API] Attempting model: ${modelName} (attempt ${attempt}/${maxAttempts})`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const response = await model.generateContent(contents);
        const text = response.response.text();
        if (text) {
          console.log(`[Decode API] ✅ Success using model: ${modelName}`);
          return { text, modelUsed: modelName };
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || '';
        const status = err?.status;

        if (
          status === 404 ||
          msg.includes('404') ||
          msg.includes('is not found') ||
          msg.includes('limit: 0') ||
          msg.includes('Quota exceeded')
        ) {
          console.warn(`[Decode API] Model ${modelName} unserviceable (${status || 'quota 0'}) — switching model instantly.`);
          break;
        }

        if (status === 503 || msg.includes('503') || msg.includes('high demand') || msg.includes('Service Unavailable')) {
          console.warn(`[Decode API] Model ${modelName} returned 503 high demand (attempt ${attempt}/${maxAttempts}).`);
          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 1500));
          }
        } else if (status === 429) {
          console.warn(`[Decode API] Model ${modelName} returned 429 rate limit.`);
          break;
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error('All Gemini Flash model endpoints failed or were busy.');
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json(
        {
          success: false,
          error: 'GEMINI_API_KEY is not configured on the server. Please check your .env.local file.',
        },
        { status: 500 }
      );
    }

    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        {
          success: false,
          error: 'No image data provided. Please upload a prescription photo.',
        },
        { status: 400 }
      );
    }

    let rawBase64 = imageBase64;
    if (rawBase64.includes(',')) {
      rawBase64 = rawBase64.split(',')[1];
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const documentPart = {
      inlineData: {
        data: rawBase64,
        mimeType: mimeType || 'image/jpeg',
      },
    };

    let result: { text: string; modelUsed: string };
    try {
      result = await generateWithSmartFlashChain(genAI, [SYSTEM_PROMPT, documentPart]);
    } catch (chainErr: any) {
      return NextResponse.json(
        {
          success: false,
          isRateLimited: true,
          error: 'Gemini API is temporarily busy. Please wait 30 seconds and try again.',
        },
        { status: 429 }
      );
    }

    let cleanedText = result.text.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText
        .replace(/^```(json)?/i, '')
        .replace(/```$/, '')
        .trim();
    }

    const parsedResult: PrescriptionDecodeResult = JSON.parse(cleanedText);

    return NextResponse.json({
      success: true,
      data: parsedResult,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Decode API Error:', error);
    const errorMessage = error?.message || '';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage || 'An unexpected error occurred while decoding the prescription.',
      },
      { status: 500 }
    );
  }
}
