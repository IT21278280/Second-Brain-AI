import { NextRequest } from "next/server";

import { toApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { knowledgeService } from "@/application/services/knowledge-service";

export async function GET() {
  try {
    const documents = await knowledgeService.listDocuments();
    return Response.json({ success: true, data: documents });
  } catch (error) {
    logger.error("Failed to list documents", error);
    return toApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const document = await knowledgeService.createDocument(body);

    return Response.json({ success: true, data: document });
  } catch (error) {
    logger.error("Failed to create document", error);
    return toApiError(error);
  }
}
