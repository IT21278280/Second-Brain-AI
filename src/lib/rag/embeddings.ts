
import { GoogleGenAI } from '@google/genai';
import { Chunk, EmbeddingResult } from '../../types/rag';

export function createGeminiClient(apiKey: string) {
  return new GoogleGenAI({ apiKey });
}

export async function generateEmbedding(client: ReturnType<typeof createGeminiClient>, text: string, model: string): Promise<number[]> {
  try {
    const response = await client.models.embedContent({
      model,
      contents: text,
    });

    const embedding = response.embeddings?.[0]?.values;
    if (!embedding || embedding.length === 0) {
      throw new Error('Gemini embedding response did not contain a valid vector');
    }

    return embedding;
  } catch (error) {
    console.error('Error generating embedding with Gemini:', error);
    throw error;
  }
}

export async function generateEmbeddingsForChunks(
  client: ReturnType<typeof createGeminiClient>,
  chunks: Chunk[],
  model: string,
): Promise<EmbeddingResult[]> {
  const embeddingPromises = chunks.map(async (chunk) => {
    const embedding = await generateEmbedding(client, chunk.content, model);
    return { chunkId: chunk.id, embedding };
  });
  return Promise.all(embeddingPromises);
}
