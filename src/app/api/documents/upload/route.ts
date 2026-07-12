import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

import { logger } from "@/lib/logger";
import { toApiError } from "@/lib/errors";
import { knowledgeService } from "@/application/services/knowledge-service";
import { RagPipeline } from "@/lib/rag/rag-pipeline";
import { RagPipelineConfig } from "@/types/rag";

interface DocumentUploadPayload {
  fileName: string;
  mimeType?: string;
  base64: string;
  title?: string;
  description?: string;
  fileSize?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DocumentUploadPayload;
    const { fileName, mimeType, base64, title, description, fileSize } = body;

    if (!fileName || !base64) {
      return new Response(JSON.stringify({ success: false, error: 'fileName and base64 are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const destPath = path.join(uploadsDir, fileName);
    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(destPath, buffer);

    // Create document record in DB (or placeholder)
    const documentPayload = {
      title: title ?? fileName,
      description: typeof description === 'string' ? description : undefined,
      originalName: fileName,
      mimeType: mimeType ?? 'application/octet-stream',
      fileSize: fileSize ?? buffer.length,
      storagePath: destPath,
      contentPreview: '',
      collectionId: undefined,
    };

    const created = await knowledgeService.createDocument(documentPayload);

    // Trigger RAG ingestion if configured
    const ragConfig: RagPipelineConfig = {
      geminiApiKey: process.env.GEMINI_API_KEY || '',
      geminiChatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash',
      geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'models/gemini-embedding-2',
      pgVectorConnectionString: process.env.DATABASE_URL || 'postgresql://user:password@host:port/database',
      topK: Number(process.env.RAG_TOP_K ?? 5),
    };

    if (ragConfig.geminiApiKey) {
      try {
        const pipeline = new RagPipeline(ragConfig);
        await pipeline.init();
        await pipeline.ingestDocument(destPath);
        await pipeline.destroy();
      } catch (err) {
        logger.error('RAG ingestion failed', err);
      }
    } else {
      logger.warn('GEMINI_API_KEY not set — skipping RAG ingestion');
    }

    return new Response(JSON.stringify({ success: true, data: created }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    logger.error('Document upload failed', error);
    return toApiError(error);
  }
}
