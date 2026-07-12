import { NextRequest } from "next/server";

import { toApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { knowledgeService } from "@/application/services/knowledge-service";

export async function GET() {
  try {
    const collections = await knowledgeService.listCollections();
    return Response.json({ success: true, data: collections });
  } catch (error) {
    logger.error("Failed to list collections", error);
    return toApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const collection = await knowledgeService.createCollection(body);

    return Response.json({ success: true, data: collection });
  } catch (error) {
    logger.error("Failed to create collection", error);
    return toApiError(error);
  }
}
