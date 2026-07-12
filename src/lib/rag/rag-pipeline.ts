
import { GoogleGenAI } from '@google/genai';
import { loadDocument } from './document-loaders';
import { chunkDocument } from './chunking';
import { createGeminiClient, generateEmbeddingsForChunks, generateEmbedding } from './embeddings';
import { PgVectorStore } from './pgvector-store';
import { Chunk, RagPipelineConfig } from '../../types/rag';

export class RagPipeline {
  private config: RagPipelineConfig;
  private pgVectorStore: PgVectorStore | null = null;
  private geminiClient: GoogleGenAI;
  private embeddingDim?: number;

  constructor(config: RagPipelineConfig) {
    if (!config.geminiApiKey) {
      throw new Error('GEMINI_API_KEY must be configured to use the RAG pipeline');
    }
    this.config = config;
    this.geminiClient = createGeminiClient(this.config.geminiApiKey);
    this.embeddingDim = config.embeddingDim;
  }

  async init() {
    // Ensure we have embedding dimension available — probe Gemini if necessary
    if (!this.embeddingDim) {
      try {
        const probe = await generateEmbedding(this.geminiClient, 'probe', this.config.geminiEmbeddingModel);
        this.embeddingDim = probe.length;
      } catch {
        console.warn('Failed to probe embedding dimension from Gemini; falling back to 3072');
        this.embeddingDim = 3072;
      }
    }

    this.pgVectorStore = new PgVectorStore(this.config.pgVectorConnectionString, 'rag_chunks', this.embeddingDim);
    await this.pgVectorStore.connect();
  }

  async destroy() {
    if (this.pgVectorStore) await this.pgVectorStore.disconnect();
  }

  async ingestDocument(filePath: string): Promise<void> {
    const documents = await loadDocument(filePath);
    if (documents.length === 0) {
      console.warn(`No documents loaded from ${filePath}`);
      return;
    }

    for (const document of documents) {
      const chunks = chunkDocument(document);
      console.log(`Generated ${chunks.length} chunks for document ${document.id}`);
      const embeddings = await generateEmbeddingsForChunks(
        this.geminiClient,
        chunks,
        this.config.geminiEmbeddingModel,
      );
      console.log(`Generated ${embeddings.length} embeddings for document ${document.id}`);
      if (!this.pgVectorStore) throw new Error('PgVectorStore not initialized');
      await this.pgVectorStore.addChunks(chunks, embeddings);
      console.log(`Stored chunks and embeddings for document ${document.id}`);
    }
  }

  async semanticSearch(query: string, topK?: number): Promise<Chunk[]> {
    const queryEmbedding = await generateEmbedding(this.geminiClient, query, this.config.geminiEmbeddingModel);
    if (!this.pgVectorStore) throw new Error('PgVectorStore not initialized');
    return this.pgVectorStore.semanticSearch(queryEmbedding, topK || this.config.topK);
  }

  async constructPrompt(query: string, retrievedChunks: Chunk[]): Promise<string> {
    const sources = retrievedChunks
      .map((chunk, index) => {
        const sourceLabel = chunk.metadata?.source ?? chunk.documentId;
        return [
          `Source ${index + 1}: ${sourceLabel}`,
          chunk.content,
        ].join('\n');
      })
      .join('\n\n---\n\n');

    return [
      'You are a helpful assistant. Answer the question using only the information provided below. Do not invent facts. If the answer is not contained in the context, say that you do not know.',
      '',
      sources,
      '',
      `Question: ${query}`,
      'Answer:',
    ].join('\n');
  }

  async generateAnswerStream(prompt: string): Promise<ReadableStream<Uint8Array>> {
    const response = await this.geminiClient.models.generateContentStream({
      model: this.config.geminiChatModel,
      contents: prompt,
    });

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text ?? '';
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }
}
