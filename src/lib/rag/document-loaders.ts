
import { Document } from '../../types/rag';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

export async function loadPdf(filePath: string): Promise<Document[]> {
  const fileBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(fileBuffer);
  const content = typeof data.text === 'string' ? data.text.trim() : '';

  return [{
    id: filePath,
    content,
    metadata: { type: 'pdf', source: filePath, pageCount: data.numpages },
  }];
}

export async function loadMarkdown(filePath: string): Promise<Document[]> {
  const content = fs.readFileSync(filePath, 'utf-8').trim();
  return [{
    id: filePath,
    content,
    metadata: { type: 'markdown', source: filePath },
  }];
}

export async function loadTxt(filePath: string): Promise<Document[]> {
  const content = fs.readFileSync(filePath, 'utf-8').trim();
  return [{
    id: filePath,
    content,
    metadata: { type: 'txt', source: filePath },
  }];
}

export async function loadDocument(filePath: string): Promise<Document[]> {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.pdf':
      return loadPdf(filePath);
    case '.md':
    case '.markdown':
      return loadMarkdown(filePath);
    case '.txt':
      return loadTxt(filePath);
    default:
      throw new Error(`Unsupported document type: ${ext}`);
  }
}
