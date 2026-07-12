
import { Client } from 'pg';
import pgvector from 'pgvector/pg';
import { Chunk, EmbeddingResult } from '../../types/rag';

export class PgVectorStore {
  private client: Client;
  private tableName: string;
  private embeddingDim: number;

  constructor(connectionString: string, tableName: string = 'rag_chunks', embeddingDim: number = 3072) {
    this.client = new Client({ connectionString });
    this.tableName = tableName;
    this.embeddingDim = embeddingDim;
  }

  async connect() {
    await this.client.connect();
    await this.client.query('CREATE EXTENSION IF NOT EXISTS vector');
    await pgvector.registerType(this.client);

    let detect: { rows: Array<{ typ?: string }> } | null = null;

    // If table exists, try to detect existing embedding dimension
    try {
      detect = await this.client.query(
        `SELECT attname, format_type(atttypid, atttypmod) AS typ FROM pg_attribute WHERE attrelid = '${this.tableName}'::regclass AND attname='embedding';`
      );
      if (detect.rows.length > 0 && typeof detect.rows[0].typ === 'string') {
        const m = detect.rows[0].typ.match(/vector\((\d+)\)/i);
        if (m) {
          this.embeddingDim = Number(m[1]);
        }
      }
    } catch {
      // table may not exist yet — we'll create it below
    }

    await this.client.query(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id VARCHAR(255) PRIMARY KEY,
        document_id VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB,
        embedding VECTOR(${this.embeddingDim}) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    if (detect && detect.rows.length > 0 && typeof detect.rows[0].typ === 'string') {
      const existingDimMatch = detect.rows[0].typ.match(/vector\((\d+)\)/i);
      const existingDim = existingDimMatch ? Number(existingDimMatch[1]) : this.embeddingDim;
      if (existingDim !== this.embeddingDim) {
        console.warn(
          `Detected existing vector dimension ${existingDim}, but current embedding dimension is ${this.embeddingDim}. Rebuilding table.`,
        );
        await this.client.query(`DROP TABLE IF EXISTS ${this.tableName};`);
        await this.client.query(`
          CREATE TABLE ${this.tableName} (
            id VARCHAR(255) PRIMARY KEY,
            document_id VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            metadata JSONB,
            embedding VECTOR(${this.embeddingDim}) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
          );
        `);
      }
    }

    await this.client.query(
      `CREATE INDEX IF NOT EXISTS ${this.tableName}_embedding_idx
      ON ${this.tableName}
      USING ivfflat (embedding vector_l2_ops);
    `,
    ).catch(() => {
      // The index may fail to create if pgvector is not configured for ivfflat;
      // proceed without it and rely on the vector operator.
    });
  }

  async disconnect() {
    await this.client.end();
  }

  async addChunks(chunks: Chunk[], embeddings: EmbeddingResult[]) {
    try {
      await this.client.query('BEGIN');

      for (const chunk of chunks) {
        const embedding = embeddings.find((item) => item.chunkId === chunk.id)?.embedding;
        if (!embedding) {
          console.warn(`No embedding found for chunk ${chunk.id}. Skipping.`);
          continue;
        }

        await this.client.query(
          `INSERT INTO ${this.tableName} (id, document_id, content, metadata, embedding)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET
             content = EXCLUDED.content,
             metadata = EXCLUDED.metadata,
             embedding = EXCLUDED.embedding,
             updated_at = now();`,
          [chunk.id, chunk.documentId, chunk.content, chunk.metadata, pgvector.toSql(embedding)],
        );
      }

      await this.client.query('COMMIT');
    } catch (error) {
      await this.client.query('ROLLBACK');
      console.error('Error adding chunks to PgVectorStore:', error);
      throw error;
    }
  }

  async semanticSearch(queryEmbedding: number[], topK: number): Promise<Chunk[]> {
    try {
      const res = await this.client.query(
        `SELECT id, document_id, content, metadata
         FROM ${this.tableName}
         ORDER BY embedding <-> $1
         LIMIT $2;`,
        [pgvector.toSql(queryEmbedding), topK],
      );

      return res.rows.map((row) => ({
        id: row.id,
        documentId: row.document_id,
        content: row.content,
        metadata: row.metadata,
      }));
    } catch (error) {
      console.error('Error during semantic search:', error);
      throw error;
    }
  }
}
