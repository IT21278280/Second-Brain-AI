import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required for Gemini health check');
  }

  console.log('GEMINI_CHAT_MODEL=', model);

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: 'Hello from RAG health check',
  });

  console.log('response.text:', response.text);
}

main().catch((error) => {
  console.error('Gemini health check failed:', error);
  process.exit(1);
});