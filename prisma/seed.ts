import "dotenv/config";
import { Client } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const pgClient = new Client({ connectionString });
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function seed() {
  await pgClient.connect();
  try {
    await pgClient.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    `);
  } finally {
    await pgClient.end();
  }

  const workspace = await prisma.workspace.upsert({
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

  const collection = await prisma.collection.upsert({
    where: { id: `${workspace.id}-product-research` },
    update: {
      name: "Product Research",
      description: "Source materials, meeting notes, and launch assets.",
      workspaceId: workspace.id,
    },
    create: {
      id: `${workspace.id}-product-research`,
      name: "Product Research",
      description: "Source materials, meeting notes, and launch assets.",
      workspaceId: workspace.id,
    },
  });

  const notes = [
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

  for (const note of notes) {
    await prisma.note.upsert({
      where: {
        id: `${workspace.id}-${note.title.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: note,
      create: {
        ...note,
        id: `${workspace.id}-${note.title.toLowerCase().replace(/\s+/g, "-")}`,
        workspaceId: workspace.id,
        userId: "seed-user",
      },
    });
  }

  const documents = [
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

  const createdDocs = [];
  for (const document of documents) {
    const createdDoc = await prisma.document.upsert({
      where: {
        id: `${workspace.id}-${document.originalName}`,
      },
      update: {
        ...document,
        workspaceId: workspace.id,
        collectionId: collection.id,
        userId: "seed-user",
      },
      create: {
        ...document,
        workspaceId: workspace.id,
        collectionId: collection.id,
        userId: "seed-user",
        id: `${workspace.id}-${document.originalName}`,
      },
    });
    createdDocs.push(createdDoc);
  }

  const chat = await prisma.chat.upsert({
    where: { id: `${workspace.id}-beta-planning` },
    update: {
      title: "Beta planning session",
      model: "llama3.1",
      temperature: 0.2,
      systemPrompt: "You are a product strategist helping the team prepare the beta release.",
      workspaceId: workspace.id,
      userId: "seed-user",
    },
    create: {
      id: `${workspace.id}-beta-planning`,
      title: "Beta planning session",
      model: "llama3.1",
      temperature: 0.2,
      systemPrompt: "You are a product strategist helping the team prepare the beta release.",
      workspaceId: workspace.id,
      userId: "seed-user",
      messages: {
        create: [
          {
            id: `${workspace.id}-beta-planning-msg-1`,
            role: "user",
            content: "Summarize the highest-impact issues to resolve before launch.",
            tokens: 22,
            latencyMs: 640,
          },
          {
            id: `${workspace.id}-beta-planning-msg-2`,
            role: "assistant",
            content: "Prioritize onboarding, search quality, and reliable document ingestion. These are the most visible issues for early users.",
            tokens: 29,
            latencyMs: 820,
          },
        ],
      },
    },
  });

  for (const document of createdDocs) {
    await prisma.chunk.upsert({
      where: { id: `${document.id}-chunk-1` },
      update: {
        content: `First content chunk for ${document.title}.`,
        metadata: { section: "summary", documentTitle: document.title },
        embedding: Buffer.from(`seed-${document.id}-chunk-1`),
      },
      create: {
        id: `${document.id}-chunk-1`,
        documentId: document.id,
        content: `First content chunk for ${document.title}.`,
        metadata: { section: "summary", documentTitle: document.title },
        embedding: Buffer.from(`seed-${document.id}-chunk-1`),
      },
    });

    await prisma.chunk.upsert({
      where: { id: `${document.id}-chunk-2` },
      update: {
        content: `Second content chunk for ${document.title}.`,
        metadata: { section: "details", documentTitle: document.title },
        embedding: Buffer.from(`seed-${document.id}-chunk-2`),
      },
      create: {
        id: `${document.id}-chunk-2`,
        documentId: document.id,
        content: `Second content chunk for ${document.title}.`,
        metadata: { section: "details", documentTitle: document.title },
        embedding: Buffer.from(`seed-${document.id}-chunk-2`),
      },
    });
  }

  console.log(`Seeded workspace ${workspace.name} with sample data.`);
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
