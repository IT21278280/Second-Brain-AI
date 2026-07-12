import { NextRequest } from "next/server";

import { toApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { knowledgeService } from "@/application/services/knowledge-service";

export async function GET() {
  try {
    const chats = await knowledgeService.listChats();
    return Response.json({ success: true, data: chats });
  } catch (error) {
    logger.error("Failed to list chats", error);
    return toApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const chat = await knowledgeService.createChat(body);

    return Response.json({ success: true, data: chat });
  } catch (error) {
    logger.error("Failed to create chat", error);
    return toApiError(error);
  }
}
