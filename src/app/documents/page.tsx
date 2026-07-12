"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Search as SearchIcon, Sparkles } from "lucide-react";

interface DocumentItem {
  id: string;
  title: string;
  collection: string;
  status: string;
  updated: string;
}

interface DocumentResponse {
  id: string;
  title: string;
  collectionId?: string | null;
  updatedAt: string;
}

const initialDocuments: DocumentItem[] = [
  { id: "", title: "Research overview", collection: "Research", status: "Indexed", updated: "Today" },
  { id: "", title: "Engineering handbook", collection: "Product", status: "Processing", updated: "Yesterday" },
  { id: "", title: "Launch checklist", collection: "Operations", status: "Ready", updated: "2d ago" },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await fetch("/api/documents");
        const payload = await response.json();
        if (payload?.success && Array.isArray(payload.data)) {
          setDocuments(
            (payload.data as DocumentResponse[]).map((doc) => ({
              id: doc.id,
              title: doc.title,
              collection: doc.collectionId ?? "Unassigned",
              status: "Ready",
              updated: new Date(doc.updatedAt).toLocaleDateString(),
            })),
          );
        }
      } catch {
        // ignore load errors
      }
    };

    loadDocuments();
  }, []);

  const readFileBase64 = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.slice(offset, offset + chunkSize));
    }
    return btoa(binary);
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setUploading(true);

    try {
      const base64 = await readFileBase64(file);
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          base64,
          title: title.trim(),
          description: description.trim() || undefined,
          fileSize: file.size,
        }),
      });

      const payload = await response.json() as { success: boolean; error?: string; data?: DocumentResponse };
      if (!response.ok || !payload?.success || !payload.data) {
        throw new Error(payload?.error || "Upload failed. Please try again.");
      }

      setTitle("");
      setDescription("");
      setFile(null);
      setError(null);

      const created = payload.data;
      setDocuments((current) => [
        {
          id: created.id,
          title: created.title,
          collection: created.collectionId ?? "Unassigned",
          status: "Ready",
          updated: new Date(created.updatedAt).toLocaleDateString(),
        },
        ...current,
      ]);
    } catch (uploadError: unknown) {
      const message = uploadError instanceof Error ? uploadError.message : "Upload failed.";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const filteredDocuments = documents.filter((document) =>
    document.title.toLowerCase().includes(search.toLowerCase()) ||
    document.collection.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Documents</h1>
            <p className="text-sm text-slate-500">Upload and manage your knowledge sources.</p>
          </div>
          <Button asChild>
            <a href="#upload-document">
              <Plus className="mr-2 h-4 w-4" /> Upload document
            </a>
          </Button>
        </div>

        <Card id="upload-document">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Upload document</CardTitle>
                <p className="text-sm text-slate-500">Add a PDF or text file to your knowledge base.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Title</span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Document title"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">File</span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.md,.docx,.doc"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="Optional description"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <Button type="submit" disabled={uploading}>
                <Plus className="mr-2 h-4 w-4" /> {uploading ? "Uploading…" : "Upload document"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Documents</CardTitle>
                <p className="text-sm text-slate-500">Your uploaded and indexed documents.</p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 md:w-80">
                <SearchIcon className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full border-0 bg-transparent text-sm outline-none"
                  placeholder="Search documents"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            {filteredDocuments.map((document) => (
              <Card key={document.id || document.title}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <Badge>{document.status}</Badge>
                  </div>
                  <CardTitle>{document.title}</CardTitle>
                  <p className="text-sm text-slate-500">{document.collection} · Updated {document.updated}</p>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Sparkles className="h-4 w-4 text-cyan-500" /> AI summary ready
                  </div>
                  <Button variant="outline" size="sm">Open</Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
