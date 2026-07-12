
import { NextRequest } from 'next/server';
import { RagPipeline } from '@/lib/rag/rag-pipeline';
import { RagPipelineConfig } from '@/types/rag';

const ragConfig: RagPipelineConfig = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiChatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash',
  geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'models/gemini-embedding-2',
  pgVectorConnectionString: process.env.DATABASE_URL || 'postgresql://user:password@host:port/database',
  topK: Number(process.env.RAG_TOP_K ?? 5),
};

let ragPipeline: RagPipeline | null = null;

async function getRagPipeline(): Promise<RagPipeline> {
  if (!ragPipeline) {
    ragPipeline = new RagPipeline(ragConfig);
    await ragPipeline.init();
  }
  return ragPipeline;
}

export async function POST(request: NextRequest) {
  const pipeline = await getRagPipeline();
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (!action) {
    return new Response(JSON.stringify({ error: 'Missing action query parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json().catch(() => ({}));

  if (action === 'ingest') {
    const filePath = typeof body.filePath === 'string' ? body.filePath : null;
    if (!filePath) {
      return new Response(JSON.stringify({ error: 'filePath is required for ingestion' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      await pipeline.ingestDocument(filePath);
      return new Response(JSON.stringify({ message: 'Document ingested successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: unknown) {
      return new Response(JSON.stringify({ error: (error as Error).message || 'Ingestion failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (action === 'search') {
    const query = typeof body.query === 'string' ? body.query : null;
    const topK = Number.isInteger(body.topK) ? body.topK : undefined;

    if (!query) {
      return new Response(JSON.stringify({ error: 'query is required for search' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const retrievedChunks = await pipeline.semanticSearch(query, topK);
      const prompt = await pipeline.constructPrompt(query, retrievedChunks);
      const stream = await pipeline.generateAnswerStream(prompt);

      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    } catch (error: unknown) {
      return new Response(JSON.stringify({ error: (error as Error).message || 'Search failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: `Unsupported action: ${action}` }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}
