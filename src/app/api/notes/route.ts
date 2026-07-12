import { NextRequest } from "next/server";

import { toApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { knowledgeService } from "@/application/services/knowledge-service";

export async function GET() {
  try {
    const notes = await knowledgeService.listNotes();
    return Response.json({ success: true, data: notes });
  } catch (error) {
    logger.error("Failed to list notes", error);
    return toApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const note = await knowledgeService.createNote(body);

    return Response.json({ success: true, data: note });
  } catch (error) {
    logger.error("Failed to create note", error);
    return toApiError(error);
  }
}
