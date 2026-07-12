import Link from "next/link";
import { ArrowRight, Bot, FileText, Layers, NotebookPen, Search, Sparkles } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Documents", value: "124", detail: "+12 this week" },
  { label: "Notes", value: "48", detail: "Auto-saved" },
  { label: "Collections", value: "9", detail: "3 shared" },
  { label: "Chats", value: "17", detail: "4 unread" },
];

const recentItems = [
  { title: "Product launch brief", type: "PDF", updated: "2h ago" },
  { title: "Architecture review", type: "Note", updated: "4h ago" },
  { title: "Research synthesis", type: "Chat", updated: "Yesterday" },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <Card className="overflow-hidden border-indigo-100 bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-white">
          <CardContent className="p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm">
                  <Sparkles className="h-4 w-4" />
                  Welcome back, Rusith!
                </div>
                <h1 className="text-3xl font-semibold tracking-tight">Your second brain is ready for the next breakthrough.</h1>
                <p className="mt-3 text-sm text-indigo-50">
                  Capture ideas, upload documents, and search your knowledge with natural language.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="secondary" className="bg-white text-indigo-700 hover:bg-indigo-50">
                  <Link href="/documents" className="inline-flex items-center">
                    <FileText className="mr-2 h-4 w-4" /> Upload document
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                  <Link href="/notes" className="inline-flex items-center">
                    <NotebookPen className="mr-2 h-4 w-4" /> New note
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <Badge>{stat.detail}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent activity</CardTitle>
                  <CardDescription>Latest documents, chats, and notes from your workspace.</CardDescription>
                </div>
                <Button variant="ghost">View all</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentItems.map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                  <div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.type} · Updated {item.updated}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Open <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
                <CardDescription>Jump into your most common tasks.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button asChild className="justify-start">
                  <Link href="/documents" className="inline-flex items-center">
                    <FileText className="mr-2 h-4 w-4" />Upload document
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/notes" className="inline-flex items-center">
                    <NotebookPen className="mr-2 h-4 w-4" />Create note
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start"><Bot className="mr-2 h-4 w-4" />Start chat</Button>
                <Button variant="outline" className="justify-start"><Layers className="mr-2 h-4 w-4" />Create collection</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI suggestions</CardTitle>
                <CardDescription>Suggestions tailored to your recent activity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Summarize your latest PDF",
                  "Continue yesterday’s conversation",
                  "Review unfinished notes",
                ].map((suggestion) => (
                  <div key={suggestion} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                    <span>{suggestion}</span>
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
