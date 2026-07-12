import type { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { chatSchema, collectionSchema, documentSchema, messageSchema, noteSchema, workspaceSchema } from "@/lib/schemas";

const db = prisma as PrismaClient;

type ChatPayload = {
  chat?: unknown;
  message?: unknown;
};

export class KnowledgeService {
  private async ensureDefaultWorkspaceId() {
    const workspace = await db.workspace.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (workspace) {
      return workspace.id;
    }

    const created = await db.workspace.create({
      data: {
        name: "Default Workspace",
        slug: "default-workspace",
        description: "Automatically created workspace.",
        ownerId: "temp-user-id",
      },
    });

    logger.info("Created default workspace", created.id);
    return created.id;
  }

  async listWorkspaces() {
    return db.workspace.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        documents: true,
        notes: true,
        collections: true,
        chats: true,
      },
    });
  }

  async createWorkspace(input: unknown) {
    const parsed = workspaceSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(400, "Invalid workspace payload", parsed.error.flatten().fieldErrors);
    }

    const workspace = await db.workspace.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.name.toLowerCase().replace(/\s+/g, "-"),
        description: parsed.data.description,
        ownerId: "temp-user-id",
      },
    });

    logger.info("Created workspace", workspace.id);
    return workspace;
  }

  async listCollections() {
    return db.collection.findMany({
      orderBy: { updatedAt: "desc" },
      include: { documents: true },
      take: 20,
    });
  }

  async createCollection(input: unknown) {
    const parsed = collectionSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(400, "Invalid collection payload", parsed.error.flatten().fieldErrors);
    }

    const workspaceId = parsed.data.workspaceId ?? (await this.ensureDefaultWorkspaceId());
    const collection = await db.collection.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        workspaceId,
      },
    });

    logger.info("Created collection", collection.id);
    return collection;
  }

  async listNotes() {
    return db.note.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
  }

  async createNote(input: unknown) {
    const parsed = noteSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(400, "Invalid note payload", parsed.error.flatten().fieldErrors);
    }

    const workspaceId = await this.ensureDefaultWorkspaceId();
    const note = await db.note.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        tags: parsed.data.tags ?? [],
        favorite: parsed.data.favorite ?? false,
        archived: parsed.data.archived ?? false,
        workspaceId,
        userId: "temp-user-id",
      },
    });

    logger.info("Created note", note.id);
    return note;
  }

  async listDocuments() {
    return db.document.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
  }

  async createDocument(input: unknown) {
    const parsed = documentSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(400, "Invalid document payload", parsed.error.flatten().fieldErrors);
    }

    const workspaceId = await this.ensureDefaultWorkspaceId();
    const document = await db.document.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        originalName: parsed.data.originalName,
        mimeType: parsed.data.mimeType,
        fileSize: parsed.data.fileSize,
        storagePath: parsed.data.storagePath,
        contentPreview: parsed.data.contentPreview,
        workspaceId,
        collectionId: parsed.data.collectionId,
        userId: "temp-user-id",
      },
    });

    logger.info("Created document", document.id);
    return document;
  }

  async listChats() {
    return db.chat.findMany({
      orderBy: { updatedAt: "desc" },
      include: { messages: true },
      take: 20,
    });
  }

  async createChat(input: unknown) {
    const payload = input as ChatPayload | undefined;
    const parsed = chatSchema.safeParse(payload?.chat);
    const messageParsed = payload?.message ? messageSchema.safeParse(payload.message) : null;

    if (!parsed.success || !messageParsed?.success) {
      throw new AppError(400, "Invalid chat payload", {
        chat: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
        message: messageParsed?.success ? undefined : messageParsed?.error?.flatten().fieldErrors,
      });
    }

    return db.$transaction(async (tx) => {
      const workspaceId = await this.ensureDefaultWorkspaceId();
      const createdChat = await tx.chat.create({
        data: {
          title: parsed.data.title,
          model: parsed.data.model ?? "llama3.1",
          temperature: parsed.data.temperature ?? 0.2,
          systemPrompt: parsed.data.systemPrompt,
          workspaceId,
          userId: "temp-user-id",
        },
      });

      const createdMessage = await tx.message.create({
        data: {
          chatId: createdChat.id,
          role: messageParsed.data.role,
          content: messageParsed.data.content,
          references: messageParsed.data.references,
          tokens: messageParsed.data.tokens,
          latencyMs: messageParsed.data.latencyMs,
        },
      });

      return { chat: createdChat, message: createdMessage };
    });
  }
}

export const knowledgeService = new KnowledgeService();
