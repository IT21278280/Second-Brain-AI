# Second Brain AI

Second Brain AI is a modern, AI-first knowledge workspace built with Next.js, TypeScript, Prisma, and PostgreSQL. It brings together notes, documents, collections, chat, and semantic search so users can capture ideas, upload knowledge, and ask questions using their own content.

This repository is based on the product requirements, UI/UX specification, and architecture direction documented in the project docs folder. The current implementation focuses on a polished MVP experience for dashboard navigation, document ingestion, note management, and retrieval-augmented generation (RAG) workflows.

## Overview

Second Brain AI is designed for individuals and teams who need a single place to:

- organize knowledge and notes
- upload and process documents
- search content semantically
- interact with an AI assistant grounded in stored documents
- manage workspaces and collections in a clean SaaS-style interface

## Key Features

### Current MVP capabilities

- Modern dashboard experience with quick access to documents, notes, chat, and collections
- Authentication and session handling with Better Auth
- Workspace-based organization for knowledge data
- Notes with tags, favorites, and archive states
- Document upload flow for PDF, Markdown, and TXT content
- Document indexing and content preview storage
- AI-powered RAG pipeline using Gemini embeddings and PostgreSQL pgvector
- Semantic search and context-aware answer generation
- Responsive UI built with Tailwind CSS and shadcn/ui patterns

### Planned / evolving areas

- richer collaboration and multi-user workspaces
- OAuth providers and advanced account management
- version history and improved document preview workflows
- advanced filtering, saved searches, and analytics
- billing, usage monitoring, and enterprise-ready controls

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript
- Styling: Tailwind CSS, shadcn/ui, Lucide icons
- Backend/API: Next.js App Router API routes
- Database: PostgreSQL with Prisma ORM
- Vector Search: pgvector
- Authentication: Better Auth
- AI: Google Gemini models for embeddings and chat generation
- Validation: Zod
- Linting: ESLint

## Architecture Summary

The application follows a layered structure that separates UI, application services, and infrastructure concerns:

- App layer: route handlers and page components under the Next.js app directory
- Application services: document, chat, and RAG orchestration logic
- Domain and validation layer: typed schemas and business-facing service logic
- Infrastructure layer: Prisma, PostgreSQL, vector storage, and Gemini integrations

## Project Structure

```text
src/
  app/
    api/
    chat/
    collections/
    dashboard/
    documents/
    notes/
    search/
    settings/
  application/
    services/
  components/
    layout/
    ui/
  lib/
    auth.ts
    prisma.ts
    schemas.ts
    rag/
  prisma/
  uploads/
```

## Core Data Models

The Prisma schema includes:

- Workspace
- Collection
- Note
- Document
- Chat
- Message
- Chunk

These models support the knowledge graph of the product and the vectorized document workflow.

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- PostgreSQL database (local or hosted)
- Google Gemini API key

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a file named .env.local in the project root and add values similar to the following:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/second_brain_ai"
BETTER_AUTH_SECRET="change-me-in-production"
BETTER_AUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_CHAT_MODEL="gemini-2.5-flash"
GEMINI_EMBEDDING_MODEL="models/gemini-embedding-2"
RAG_TOP_K="5"
```

### 3. Generate Prisma client and prepare the database

```bash
npx prisma generate
npx prisma db push
```

If you prefer migrations during active development:

```bash
npx prisma migrate dev --name init
```

### 4. Run the app locally

```bash
npm run dev
```

Open http://localhost:3000 to view the app.

## Available Scripts

```bash
npm run dev      # start the development server
npm run build    # create a production build
npm run start    # run the production build locally
npm run lint     # run ESLint
```

## API Highlights

The app exposes a set of API routes under the app router, including:

- /api/auth/[...all] for authentication endpoints
- /api/documents for listing documents
- /api/documents/upload for uploading and ingesting files
- /api/rag for retrieval and answer generation flows
- /api/notes, /api/collections, /api/chat, and /api/workspaces for knowledge operations

## RAG and Document Processing Flow

Documents can be uploaded and processed through a retrieval pipeline that:

1. stores the file locally in the uploads folder
2. creates a document record in the database
3. extracts content from supported files
4. splits content into chunks
5. generates embeddings using Gemini
6. stores embeddings in pgvector for semantic search and grounded answers

## Development Notes

- The UI is organized around a dashboard-first experience inspired by the product design spec.
- The current implementation favors a practical MVP structure over a fully modularized enterprise architecture.
- The Prisma schema and service layer are designed to evolve toward richer multi-workspace and collaboration features.

## Roadmap

Planned improvements include:

- real-time collaboration in shared workspaces
- richer document preview and OCR-ready architecture
- full semantic search refinement and relevance tuning
- better versioning and note history
- admin controls, analytics, and billing workflows

## Screenshots

Below is a preview of the current UI screens captured from the app:

- **Home**
- **Dashboard**
- **AI Chat**
- **Search**
- **Collections**
- **Documents**
- **Notes**
- **Settings**

<p align="center">
  <img src="./screenshots/Home.jpeg" alt="Home screen" width="320" />
  <img src="./screenshots/Dashboard.jpeg" alt="Dashboard screen" width="320" />
  <img src="./screenshots/AI Chat.jpeg" alt="AI Chat screen" width="320" />
</p>
<p align="center"><em>Home dashboard, workspace overview, and AI chat experience.</em></p>

<p align="center">
  <img src="./screenshots/Search.jpeg" alt="Search screen" width="320" />
  <img src="./screenshots/Collections.jpeg" alt="Collections screen" width="320" />
  <img src="./screenshots/Documents.jpeg" alt="Documents screen" width="320" />
</p>
<p align="center"><em>Semantic search, organized collections, and document upload/indexing.</em></p>

<p align="center">
  <img src="./screenshots/Notes.jpeg" alt="Notes screen" width="320" />
  <img src="./screenshots/Settings.jpeg" alt="Settings screen" width="320" />
</p>
<p align="center"><em>Note creation workflow and user/workspace settings.</em></p>

## Contributing

Contributions are welcome. A good workflow is:

1. fork the repository
2. create a feature branch
3. make your changes
4. run linting and build checks
5. submit a pull request with a clear summary

## License

A license file has not been added to the repository yet. Choose and add an appropriate open-source or proprietary license before public distribution.
