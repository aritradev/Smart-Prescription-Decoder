import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing Key:', apiKey);

const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash-8b',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-pro',
  'gemini-2.0-pro-exp'
];

async function findWorkingModel() {
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const res = await model.generateContent('Hi');
      console.log(`✅ SUCCESS! Model ${modelName} works! Response:`, res.response.text());
      return modelName;
    } catch (err) {
      console.log(`❌ FAILED ${modelName}:`, err.message || err);
    }
  }
  console.log('All models tested.');
}

findWorkingModel();
