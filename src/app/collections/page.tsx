import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Plus, Sparkles } from "lucide-react";

const collections = [
  { name: "Research", documents: 42, notes: 14, updated: "2h ago" },
  { name: "Product", documents: 18, notes: 9, updated: "3h ago" },
  { name: "Personal", documents: 29, notes: 11, updated: "Yesterday" },
];

export default function CollectionsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Collections</h1>
            <p className="text-sm text-slate-500">Organize knowledge by topic, project, or context.</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New collection
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {collections.map((collection) => (
            <Card key={collection.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Layers className="h-5 w-5" />
                  </div>
                  <Badge>Active</Badge>
                </div>
                <CardTitle>{collection.name}</CardTitle>
                <p className="text-sm text-slate-500">Updated {collection.updated}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{collection.documents} documents</span>
                  <span>{collection.notes} notes</span>
                </div>
                <Button variant="outline" className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" /> Open collection
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
