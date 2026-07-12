import "dotenv/config";
import { Client } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

function isConnectionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("Can't reach database server") || message.includes("P1001") || message.includes("ECONNREFUSED") || message.includes("ENOTFOUND");
}

async function createDatabaseSchema(client: Client) {
  const sql = `
    DROP TABLE IF EXISTS "Chunk" CASCADE;
    DROP TABLE IF EXISTS "Message" CASCADE;
    DROP TABLE IF EXISTS "Chat" CASCADE;
    DROP TABLE IF EXISTS "Document" CASCADE;
    DROP TABLE IF EXISTS "Note" CASCADE;
    DROP TABLE IF EXISTS "Collection" CASCADE;
    DROP TABLE IF EXISTS "Workspace" CASCADE;
    DROP TABLE IF EXISTS chunk CASCADE;
    DROP TABLE IF EXISTS message CASCADE;
    DROP TABLE IF EXISTS chat CASCADE;
    DROP TABLE IF EXISTS document CASCADE;
    DROP TABLE IF EXISTS note CASCADE;
    DROP TABLE IF EXISTS collection CASCADE;
    DROP TABLE IF EXISTS workspace CASCADE;

    CREATE TABLE "Workspace" (
      "id" text PRIMARY KEY,
      "name" text NOT NULL,
      "slug" text NOT NULL UNIQUE,
      "description" text,
      "ownerId" text,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE "Collection" (
      "id" text PRIMARY KEY,
      "name" text NOT NULL,
      "description" text,
      "workspaceId" text NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE "Note" (
      "id" text PRIMARY KEY,
      "title" text NOT NULL,
      "content" text NOT NULL,
      "tags" text[] NOT NULL DEFAULT ARRAY[]::text[],
      "favorite" boolean NOT NULL DEFAULT false,
      "archived" boolean NOT NULL DEFAULT false,
      "workspaceId" text NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
      "userId" text,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE "Document" (
      "id" text PRIMARY KEY,
      "title" text NOT NULL,
      "description" text,
      "originalName" text,
      "mimeType" text,
      "fileSize" integer,
      "storagePath" text NOT NULL,
      "contentPreview" text,
      "workspaceId" text NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
      "collectionId" text REFERENCES "Collection"("id") ON DELETE SET NULL,
      "userId" text NOT NULL,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE "Chat" (
      "id" text PRIMARY KEY,
      "title" text NOT NULL,
      "model" text,
      "temperature" float,
      "systemPrompt" text,
      "workspaceId" text NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE,
      "userId" text,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE "Message" (
      "id" text PRIMARY KEY,
      "chatId" text NOT NULL REFERENCES "Chat"("id") ON DELETE CASCADE,
      "role" text NOT NULL,
      "content" text NOT NULL,
      "references" jsonb,
      "tokens" integer,
      "latencyMs" integer,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE "Chunk" (
      "id" text PRIMARY KEY,
      "documentId" text NOT NULL REFERENCES "Document"("id") ON DELETE CASCADE,
      "content" text NOT NULL,
      "metadata" jsonb,
      "embedding" bytea NOT NULL,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    );
  `;

  await client.query(sql);
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const pgClient = new Client({ connectionString });
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
  }),
});

async function ensureWorkspace() {
  return prisma.workspace.upsert({
    where: { slug: "second-brain-ai" },
    update: {
      name: "Second Brain AI",
      description: "A production-ready workspace for research, notes, and product planning.",
      ownerId: "seed-user",
    },
    create: {
      name: "Second Brain AI",
      slug: "second-brain-ai",
      description: "A production-ready workspace for research, notes, and product planning.",
      ownerId: "seed-user",
    },
  });
}

async function ensureCollection(workspaceId: string) {
  const existing = await prisma.collection.findFirst({
    where: { workspaceId, name: "Product Research" },
  });

  if (existing) {
    return existing;
  }

  return prisma.collection.create({
    data: {
      workspaceId,
      name: "Product Research",
      description: "Source materials, meeting notes, and launch assets.",
    },
  });
}

async function ensureNotes(workspaceId: string) {
  const seedNotes = [
    {
      title: "Weekly priorities",
      content:
        "Focus on onboarding clarity, AI response quality, and a polished knowledge graph experience. Capture customer requests in the workspace after each meeting.",
      tags: ["planning", "product"],
      favorite: true,
      archived: false,
    },
    {
      title: "Launch checklist",
      content:
        "Validate auth flow, sync embeddings, confirm document upload limits, and review analytics event tracking before the beta release.",
      tags: ["launch", "ops"],
      favorite: false,
      archived: false,
    },
    {
      title: "Customer insights",
      content:
        "Early users want faster search, better note linking, and context-aware summaries. These themes should drive the next sprint.",
      tags: ["customers", "insights"],
      favorite: true,
      archived: false,
    },
    {
      title: "AI annotation guidelines",
      content:
        "Document how we label prompts, handle user privacy, and store extracted vectors. Keep the process lightweight for rapid iteration.",
      tags: ["ai", "guidelines"],
      favorite: false,
      archived: false,
    },
  ];

  for (const note of seedNotes) {
    await prisma.note.upsert({
      where: {
        id: `${workspaceId}-${note.title.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: note,
      create: {
        ...note,
        workspaceId,
        userId: "seed-user",
        id: `${workspaceId}-${note.title.toLowerCase().replace(/\s+/g, "-")}`,
      },
    });
  }
}

async function ensureDocuments(workspaceId: string, collectionId: string) {
  const seedDocuments = [
    {
      title: "Executive Summary",
      description: "Highlights key product goals, target customers, and beta success criteria.",
      originalName: "executive-summary.pdf",
      mimeType: "application/pdf",
      fileSize: 248000,
      storagePath: "uploads/executive-summary.pdf",
      contentPreview: "The product will combine workspace memory, retrieval, and AI-assisted collaboration.",
    },
    {
      title: "Customer Interview Notes",
      description: "A synthesis of interviews with design, research, and operations teams.",
      originalName: "customer-interviews.md",
      mimeType: "text/markdown",
      fileSize: 18432,
      storagePath: "uploads/customer-interviews.md",
      contentPreview: "Users repeatedly asked for faster search, stronger tagging, and cleaner exports.",
    },
    {
      title: "Product Requirements Draft",
      description: "A draft of the core SaaS requirements for MVP and early adoption metrics.",
      originalName: "prd-draft.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileSize: 112000,
      storagePath: "uploads/prd-draft.docx",
      contentPreview: "Build a note-centric research workspace with instant vector retrieval and insights.",
    },
  ];

  const createdDocuments = [];
  for (const document of seedDocuments) {
    const createdDocument = await prisma.document.upsert({
      where: {
        id: `${workspaceId}-${document.originalName}`,
      },
      update: {
        ...document,
        workspaceId,
        collectionId,
        userId: "seed-user",
      },
      create: {
        ...document,
        workspaceId,
        collectionId,
        userId: "seed-user",
        id: `${workspaceId}-${document.originalName}`,
      },
    });
    createdDocuments.push(createdDocument);
  }

  return createdDocuments;
}

async function ensureChunks(documentId: string) {
  const seedChunks = [
    {
      id: `${documentId}-chunk-1`,
      content: "This is the first chunk of the document, containing the opening summary and key themes.",
      metadata: { section: "overview", source: "seed" },
    },
    {
      id: `${documentId}-chunk-2`,
      content: "This is the second chunk containing deeper detail and actionable insights.",
      metadata: { section: "details", source: "seed" },
    },
  ];

  for (const chunk of seedChunks) {
    await prisma.chunk.upsert({
      where: { id: chunk.id },
      update: {
        content: chunk.content,
        metadata: chunk.metadata,
        embedding: Buffer.from(`embedding-${chunk.id}`),
      },
      create: {
        id: chunk.id,
        documentId,
        content: chunk.content,
        metadata: chunk.metadata,
        embedding: Buffer.from(`embedding-${chunk.id}`),
      },
    });
  }
}

async function ensureChat(workspaceId: string) {
  const existing = await prisma.chat.findFirst({
    where: { workspaceId, title: "Beta planning session" },
  });

  if (existing) {
    return existing;
  }

  return prisma.chat.create({
    data: {
      title: "Beta planning session",
      model: "llama3.1",
      temperature: 0.2,
      systemPrompt: "You are a product strategist helping the team prepare the beta release.",
      workspaceId,
      userId: "seed-user",
      messages: {
        create: [
          {
            role: "user",
            content: "Summarize the highest-impact issues to resolve before launch.",
            tokens: 22,
            latencyMs: 640,
          },
          {
            role: "assistant",
            content: "Prioritize onboarding, search quality, and reliable document ingestion. These are the most visible issues for early users.",
            tokens: 29,
            latencyMs: 820,
          },
        ],
      },
    },
  });
}

async function main() {
  console.log("Provisioning database schema...");
  await pgClient.connect();
  try {
    await createDatabaseSchema(pgClient);
  } finally {
    await pgClient.end();
  }

  const workspace = await ensureWorkspace();
  const collection = await ensureCollection(workspace.id);

  await ensureNotes(workspace.id);
  const documents = await ensureDocuments(workspace.id, collection.id);
  await ensureChat(workspace.id);
  await ensureChunks(documents[0].id);
  await ensureChunks(documents[1].id);
  await ensureChunks(documents[2].id);

  console.log(`Seeded workspace ${workspace.name} with notes, documents, chunks, and chat data.`);
}

main()
  .catch((error) => {
    if (isConnectionError(error)) {
      console.error("Seed failed because the Neon database is not reachable from this environment.");
      console.error("Verify the DATABASE_URL host and network access, then run: npx prisma db push");
    } else {
      console.error("Seed failed:", error);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
