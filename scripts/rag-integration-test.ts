import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { RagPipeline } from '@/lib/rag/rag-pipeline';
import { RagPipelineConfig } from '@/types/rag';

async function main() {
  const config: RagPipelineConfig = {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiChatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash',
    geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'models/gemini-embedding-2',
    pgVectorConnectionString: process.env.DATABASE_URL || '',
    topK: Number(process.env.RAG_TOP_K ?? 5),
  };

  if (!config.pgVectorConnectionString) {
    throw new Error('DATABASE_URL is not configured');
  }

  const pipeline = new RagPipeline(config);
  await pipeline.init();

  const tempTxtPath = path.resolve('./scripts/rag-test-sample.txt');
  fs.writeFileSync(tempTxtPath, 'This is a test document. It contains content for text retrieval. The model should return relevant chunks in semantic search.');

  console.log('Ingesting sample document...');
  await pipeline.ingestDocument(tempTxtPath);
  console.log('Ingestion completed.');

  const query = 'What is the sample document about?';
  console.log('Running semantic search for query:', query);
  const retrievedChunks = await pipeline.semanticSearch(query, 3);
  console.log('Retrieved chunks:', retrievedChunks.map((chunk) => ({ id: chunk.id, content: chunk.content.slice(0, 120) })));

  const prompt = await pipeline.constructPrompt(query, retrievedChunks);
  console.log('Prompt constructed:', prompt.slice(0, 400));

  const stream = await pipeline.generateAnswerStream(prompt);
  const reader = stream.getReader();
  let responseText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    responseText += new TextDecoder().decode(value);
  }

  console.log('Gemini streaming response chunk preview:\n', responseText.slice(0, 800));

  await pipeline.destroy();
}

main().catch((error) => {
  console.error('RAG integration test failed:', error);
  process.exit(1);
});
