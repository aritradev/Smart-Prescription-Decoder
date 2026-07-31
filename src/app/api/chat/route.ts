import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const RX_DECODE_SYSTEM_PROMPT = `
You are an expert medical prescription decoder & clinical assistant for the Bangladeshi healthcare market.

If an image is attached, follow these TWO PASSES strictly:

━━━ PASS 1: OCR & STRUCTURED PARSING ━━━
1. Read the handwritten or printed prescription image using OCR.
2. Identify every medicine, its dosage, frequency, and duration.
3. Translate ALL Bengali text and medical shorthand into English/Bengali as instructed:
   - Bengali numerals (১২৩) → Arabic numerals (123)
   - "খাওয়ার পর" → "After meal", "খাওয়ার আগে" → "Before meal"
   - "১-০-১" → frequencyPerDay: 2, "১-১-১" → frequencyPerDay: 3, "০-০-১" → frequencyPerDay: 1
   - "BD" → 2 times/day, "TDS" → 3 times/day, "QID" → 4 times/day, "OD" → 1 time/day, "SOS" → as needed
4. For each medicine, determine unit type: "tablet", "capsule", "syrup", "drop", "inhaler", "injection", or "other"

━━━ PASS 2: SEARCH & PHARMA GROUNDING ━━━
5. Provide current Bangladeshi BDT pricing (Medex.com.bd context) and 3 alternative brands available in Bangladesh:
   - index 0 & 1: best equivalent match (type: "best")
   - index 2: cheaper option of same generic (type: "cheaper")

━━━ REQUIRED OUTPUT FORMAT ━━━
You MUST return ONLY a valid JSON object matching this schema. No markdown wrappers around the JSON.

{
  "chatReply": "Brief helpful summary of the prescription.",
  "prescriptionData": {
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
}
`;

const GENERAL_CHAT_SYSTEM_PROMPT = `
You are an expert AI Medical & Pharmaceutical Assistant specializing in the Bangladeshi healthcare market (Medex.com.bd context).
Provide clear, accurate, concise, and beautifully structured answers.

FORMATTING RULES FOR IMPRESSIVE RESPONSES:
- Use clean Markdown headers (### 🌅 Morning / ### ☀️ Afternoon / ### 🌙 Night / ### 💊 Dosage & Prices).
- Use bullet points (* **Item:** description) for clear readability.
- Use bold text (**important term**) for medicine names, timings, and prices.
- Break content into logical, well-spaced sections.
- Keep the language natural, professional, and empathetic.
- Always include a brief medical disclaimer where relevant.

━━━ PRESCRIPTION MODIFICATION RULES ━━━
1. You have access to the ACTIVE PRESCRIPTION JSON DATA (if provided).
2. If the user asks about an alternative brand or generic option, answer their question informative. DO NOT update the prescription JSON data if the user is ONLY asking or inquiring.
3. IF AND ONLY IF the user EXPLICITLY CONFIRMS a medicine swap (e.g., "Yes, change Trilock 10 to Montene 10", "Confirm switch", "Update my prescription to use Montene"), THEN AND ONLY THEN modify the prescription JSON data.
4. When a swap is explicitly confirmed:
   - Return a JSON response containing both "chatReply" and the updated "prescriptionData".
   - Update the swapped medicine's brandName, manufacturer, genericName, unitPrice, unitPriceValue, stripPrice, and stripPriceValue to the new confirmed brand!
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
    // gemini-3.6-flash gets 3 attempts, all others get 2 attempts
    const maxAttempts = modelName === 'gemini-3.6-flash' ? 3 : 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Chat API] Attempting model: ${modelName} (attempt ${attempt}/${maxAttempts})`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const response = await model.generateContent(contents);
        const text = response.response.text();
        if (text) {
          console.log(`[Chat API] ✅ Success using model: ${modelName}`);
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
          console.warn(`[Chat API] Model ${modelName} unserviceable (${status || 'quota 0'}) — switching model instantly.`);
          break;
        }

        if (status === 503 || msg.includes('503') || msg.includes('high demand') || msg.includes('Service Unavailable')) {
          console.warn(`[Chat API] Model ${modelName} returned 503 high demand (attempt ${attempt}/${maxAttempts}).`);
          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 1500));
          }
        } else if (status === 429) {
          console.warn(`[Chat API] Model ${modelName} returned 429 rate limit.`);
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

    const body = await request.json();
    const { message, imageBase64, mimeType, history, targetLanguage, activePrescriptionData } = body;

    const genAI = new GoogleGenerativeAI(apiKey);

    // Format previous 15 chat messages into conversational context string
    let conversationHistoryContext = '';
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-15);
      conversationHistoryContext = '\n\n━━━ PREVIOUS CONVERSATION CONTEXT (LAST 15 MESSAGES) ━━━\n';
      recentHistory.forEach((h: { role: string; content: string }) => {
        if (h.content && h.content.trim()) {
          const roleLabel = h.role === 'user' ? 'User' : 'Assistant';
          conversationHistoryContext += `${roleLabel}: ${h.content}\n`;
        }
      });
      conversationHistoryContext += '━━━ END PREVIOUS CONVERSATION CONTEXT ━━━\n\n';
    }

    // Attach active prescription JSON data context if available
    let rxDataContext = '';
    if (activePrescriptionData && activePrescriptionData.medicines) {
      rxDataContext = `\n\n━━━ CURRENT ACTIVE PRESCRIPTION JSON DATA ━━━\n${JSON.stringify(
        activePrescriptionData,
        null,
        2
      )}\n━━━ END ACTIVE PRESCRIPTION JSON DATA ━━━\n\n`;
    }

    // Comprehensive Language directive
    const isBanglaRequested =
      targetLanguage === 'bn' ||
      (message && (message.includes('Bangla') || message.includes('বাংলা') || message.includes('bengali')));

    let langInstruction = '';
    if (isBanglaRequested) {
      langInstruction = `
━━━ STRICT BENGALI OUTPUT DIRECTIVE ━━━
The user requested response in BENGALI (বাংলা ভাষায়).
1. Write "chatReply" COMPLETELY IN NATURAL BENGALI (বাংলা ভাষায় পুরো সারসংক্ষেপ ও বিস্তারিত তথ্য উপস্থাপন করুন).
2. Inside "prescriptionData" JSON:
   - Write "dosage" in Bengali (যেমন: "১টি ট্যাবলেট খাওয়ার পর")
   - Write "frequency" in Bengali (যেমন: "১-০-১ (সকাল ও রাত)")
   - Write "duration" in Bengali (যেমন: "৭ দিন")
   - Write "doctorNotes" in Bengali (যেমন: "রোগী রাতে ট্যাবলেট সেবন করবেন")
   - Write "generalInstructions" in Bengali (যেমন: "প্রচুর পানি খাবেন, আলো থেকে দূরে রাখুন")
   - Write all "sideEffects" in Bengali (যেমন: ["মাথা ব্যথা", "বমি ভাব", "পেটে অস্বস্তি"])
━━━ END BENGALI DIRECTIVE ━━━
`;
    } else if (targetLanguage === 'en') {
      langInstruction = '\nIMPORTANT: Provide the response / chat summary in ENGLISH with clear markdown headers and bullet points.\n';
    }

    let result: { text: string; modelUsed: string };

    // Case 1: Prescription Photo Uploaded
    if (imageBase64) {
      let rawBase64 = imageBase64;
      if (rawBase64.includes(',')) {
        rawBase64 = rawBase64.split(',')[1];
      }

      const documentPart = {
        inlineData: {
          data: rawBase64,
          mimeType: mimeType || 'image/jpeg',
        },
      };

      const userInstruction = message
        ? `User Instructions & Question: "${message}"`
        : 'Please decode this medical prescription image completely and calculate BDT prices.';

      const fullPrompt = `${RX_DECODE_SYSTEM_PROMPT}${rxDataContext}${conversationHistoryContext}${langInstruction}\n${userInstruction}`;

      try {
        result = await generateWithSmartFlashChain(genAI, [fullPrompt, documentPart]);
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

      try {
        const parsed = JSON.parse(cleanedText);
        return NextResponse.json({
          success: true,
          chatReply: parsed.chatReply || 'Here is your decoded prescription details with BDT pricing.',
          prescriptionData: parsed.prescriptionData,
          modelUsed: result.modelUsed,
        });
      } catch (pErr) {
        return NextResponse.json({
          success: true,
          chatReply: cleanedText,
          prescriptionData: null,
          modelUsed: result.modelUsed,
        });
      }
    }

    // Case 2: Standard Medical Question (Text Only)
    const userInstruction = message || 'Hello! How can I help you with your medications today?';
    const fullPrompt = `${GENERAL_CHAT_SYSTEM_PROMPT}${rxDataContext}${conversationHistoryContext}${langInstruction}\nUser Question: ${userInstruction}\n\nIf you are returning updated prescriptionData JSON because the user explicitly confirmed a medicine swap, return a JSON object with schema {"chatReply": "string", "prescriptionData": {...}}. Otherwise, return text.`;

    try {
      result = await generateWithSmartFlashChain(genAI, [fullPrompt]);
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

    // Check if Gemini returned JSON containing updated prescriptionData
    try {
      const parsed = JSON.parse(cleanedText);
      if (parsed.chatReply || parsed.prescriptionData) {
        return NextResponse.json({
          success: true,
          chatReply: parsed.chatReply || cleanedText,
          prescriptionData: parsed.prescriptionData || null,
          modelUsed: result.modelUsed,
        });
      }
    } catch (pErr) {
      // Not JSON — standard text reply
    }

    return NextResponse.json({
      success: true,
      chatReply: result.text,
      prescriptionData: null,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    const errorMessage = error?.message || '';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage || 'An unexpected error occurred while processing your request.',
      },
      { status: 500 }
    );
  }
}
