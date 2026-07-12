
export interface Document {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
}

export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, unknown>;
}

export interface EmbeddingResult {
  chunkId: string;
  embedding: number[];
}

export interface RagPipelineConfig {
  geminiApiKey: string;
  geminiChatModel: string;
  geminiEmbeddingModel: string;
  pgVectorConnectionString: string;
  topK: number;
  embeddingDim?: number;
}
