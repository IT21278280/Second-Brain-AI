import { NextRequest } from "next/server";

import { toApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { knowledgeService } from "@/application/services/knowledge-service";

export async function GET() {
  try {
    const workspaces = await knowledgeService.listWorkspaces();
    return Response.json({ success: true, data: workspaces });
  } catch (error) {
    logger.error("Failed to list workspaces", error);
    return toApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const workspace = await knowledgeService.createWorkspace(body);

    return Response.json({ success: true, data: workspace });
  } catch (error) {
    logger.error("Failed to create workspace", error);
    return toApiError(error);
  }
}
