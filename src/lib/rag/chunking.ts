
import { Document, Chunk } from '../../types/rag';

function normalizeText(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

export function chunkDocument(document: Document, chunkSize: number = 1000, chunkOverlap: number = 200): Chunk[] {
  const text = normalizeText(document.content);
  const chunks: Chunk[] = [];

  if (text.length === 0) {
    return chunks;
  }

  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    let endIndex = Math.min(startIndex + chunkSize, text.length);

    if (endIndex < text.length) {
      const lastSpace = text.lastIndexOf(' ', endIndex);
      if (lastSpace > startIndex) {
        endIndex = lastSpace;
      }
    }

    const content = text.slice(startIndex, endIndex).trim();
    if (!content) {
      break;
    }

    chunks.push({
      id: `${document.id}-chunk-${chunkIndex}`,
      documentId: document.id,
      content,
      metadata: { ...document.metadata, chunkIndex },
    });

    chunkIndex += 1;

    if (endIndex >= text.length) {
      break;
    }

    startIndex = Math.max(endIndex - chunkOverlap, endIndex === startIndex ? endIndex + 1 : endIndex - chunkOverlap);
  }

  return chunks;
}
