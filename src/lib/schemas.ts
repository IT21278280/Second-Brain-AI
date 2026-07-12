import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const workspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
  description: z.string().optional(),
});

export const collectionSchema = z.object({
  name: z.string().min(1, "Collection name is required"),
  description: z.string().optional(),
  workspaceId: z.string().optional(),
});

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).optional(),
  favorite: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export const documentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  collectionId: z.string().optional(),
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  fileSize: z.number().positive(),
  storagePath: z.string().min(1),
  contentPreview: z.string().optional(),
});

export const chatSchema = z.object({
  title: z.string().min(1, "Title is required"),
  model: z.string().optional(),
  temperature: z.number().optional(),
  systemPrompt: z.string().optional(),
});

export const messageSchema = z.object({
  chatId: z.string().min(1),
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string().min(1),
  references: z.any().optional(),
  tokens: z.number().optional(),
  latencyMs: z.number().optional(),
});
