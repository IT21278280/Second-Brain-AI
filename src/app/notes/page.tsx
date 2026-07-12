"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotebookPen, Star } from "lucide-react";

interface NoteItem {
  id: string;
  title: string;
  tags: string[];
  favorite: boolean;
  content?: string;
}

interface NotesApiResponse {
  success: boolean;
  error?: string;
  data?: NoteItem[];
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const response = await fetch("/api/notes");
        const payload = (await response.json()) as NotesApiResponse;

        if (payload.success && Array.isArray(payload.data)) {
          setNotes(payload.data.map((note) => ({
            id: note.id,
            title: note.title,
            tags: note.tags || [],
            favorite: note.favorite ?? false,
            content: note.content,
          })));
        }
      } catch {
        // ignore loading errors
      }
    };

    loadNotes();
  }, []);

  const handleCreateNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Both title and content are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      const payload = (await response.json()) as NotesApiResponse;
      const newNote = payload.data?.[0];

      if (!response.ok || !payload.success || !newNote) {
        throw new Error(payload.error || "Could not create note.");
      }

      setNotes((current) => [
        {
          id: newNote.id,
          title: newNote.title,
          tags: newNote.tags || [],
          favorite: newNote.favorite ?? false,
          content: newNote.content,
        },
        ...current,
      ]);

      setTitle("");
      setContent("");
      setTags("");
    } catch (submitError: unknown) {
      const message = submitError instanceof Error ? submitError.message : "Unable to create note.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Notes</h1>
            <p className="text-sm text-slate-500">Capture thoughts, write clearly, and let AI help refine them.</p>
          </div>
          <Button asChild>
            <a href="#create-note">
              <NotebookPen className="mr-2 h-4 w-4" /> Create note
            </a>
          </Button>
        </div>

        <Card id="create-note">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>New note</CardTitle>
                <p className="text-sm text-slate-500">Write a note and save it to your workspace.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Title</span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Note title"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Tags</span>
                  <input
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="Comma-separated tags"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </label>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Content</span>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={6}
                  placeholder="Write your note here..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </label>
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <Button type="submit" disabled={loading}>
                <NotebookPen className="mr-2 h-4 w-4" /> {loading ? "Saving…" : "Create note"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {notes.length === 0 ? (
          <Card>
            <CardContent className="text-slate-500">No notes yet. Create your first note above.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{note.title}</CardTitle>
                    {note.favorite && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-slate-500">
                  {note.content ? note.content.substring(0, 120) : "No content yet."}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
