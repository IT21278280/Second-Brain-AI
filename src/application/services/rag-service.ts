import { RagPipeline } from '../../lib/rag/rag-pipeline';
import { RagPipelineConfig, Chunk } from '../../types/rag';

// TODO: Load these from environment variables or a configuration service
const ragConfig: RagPipelineConfig = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiChatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash',
  geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'models/gemini-embedding-2',
  pgVectorConnectionString: process.env.DATABASE_URL || 'postgresql://user:password@host:port/database',
  topK: 5,
};

let ragPipeline: RagPipeline | null = null;

export async function getRagService(): Promise<RagPipeline> {
  if (!ragPipeline) {
    ragPipeline = new RagPipeline(ragConfig);
    await ragPipeline.init();
  }
  return ragPipeline;
}

export async function ingestDocumentService(filePath: string): Promise<void> {
  const service = await getRagService();
  await service.ingestDocument(filePath);
}

export async function semanticSearchService(query: string, topK?: number): Promise<Chunk[]> {
  const service = await getRagService();
  return service.semanticSearch(query, topK);
}

export async function constructPromptService(query: string, retrievedChunks: Chunk[]): Promise<string> {
  const service = await getRagService();
  return service.constructPrompt(query, retrievedChunks);
}
