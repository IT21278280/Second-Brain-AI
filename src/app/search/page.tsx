import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

const results = [
  { title: "AI onboarding notes", type: "Note", preview: "Summaries of onboarding flows and customer interview takeaways.", score: "96%" },
  { title: "Product architecture PDF", type: "Document", preview: "Key architecture decisions, data flows, and RAG integration notes.", score: "92%" },
  { title: "Design system chat", type: "Chat", preview: "Conversation about component consistency across the dashboard experience.", score: "89%" },
];

export default function SearchPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Semantic search</CardTitle>
            <p className="text-sm text-slate-500">Find notes, documents, and conversations with natural language.</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <SearchIcon className="ml-2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search your knowledge base" className="border-0 bg-transparent shadow-none focus:ring-0" />
              <Button>Search</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {results.map((result) => (
            <Card key={result.title}>
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge>{result.type}</Badge>
                    <span className="text-sm text-slate-500">Relevance {result.score}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">{result.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{result.preview}</p>
                </div>
                <Button variant="outline" size="sm">Open</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
