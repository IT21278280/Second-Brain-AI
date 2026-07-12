import Link from "next/link";
import { ArrowRight, Bot, FileText, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "AI chat workspace",
    description: "Ask questions, summarize documents, and keep your knowledge in one conversation.",
    icon: Bot,
  },
  {
    title: "Smart document uploads",
    description: "Upload PDFs and notes with instant semantic search and AI summaries.",
    icon: FileText,
  },
  {
    title: "Searchable knowledge",
    description: "Find context across notes, documents, and collections with one query.",
    icon: Search,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(91,75,255,0.12),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.1),_transparent_18%),#f8fafc] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200/80 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-[#5B4BFF] text-white shadow-[0_10px_30px_rgba(91,75,255,0.16)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Second Brain AI</p>
              <p className="text-xs text-slate-500">A premium AI workspace for your knowledge.</p>
            </div>
          </div>

          

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" asChild className="rounded-[12px] border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:bg-slate-50 hover:text-slate-900">
              <Link href="/dashboard">Open app</Link>
            </Button>
            <Button size="lg" asChild className="rounded-[12px] bg-[#5B4BFF] px-5 text-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-transform duration-200 hover:bg-[#4C3FFF] hover:-translate-y-0.5">
              <Link href="/dashboard">Get started</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-6">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-10 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] px-3 py-1 text-sm font-medium text-[#5B4BFF]">
              <Sparkles className="h-4 w-4" /> Built for modern knowledge work
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              A smarter knowledge workspace with AI, search, and document insight.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Second Brain AI turns notes, PDFs, chats, and collections into a unified workspace that feels polished, fast, and ready for serious thinking.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild className="rounded-[12px] bg-[#5B4BFF] px-6 text-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#4C3FFF]">
                <Link href="/dashboard">Start exploring</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-[12px] border-slate-300 bg-white text-slate-900 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-50">
                <Link href="/chat">Try AI chat</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1"
            >
              <CardHeader className="space-y-4 p-0">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[#EEF2FF] text-[#5B4BFF] shadow-sm">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-slate-950">{feature.title}</CardTitle>
                <CardDescription className="text-slate-600">{feature.description}</CardDescription>
              </CardHeader>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-700 transition group-hover:text-[#5B4BFF]">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
            </Card>
          ))}
        </section>

      

        
      </div>
    </main>
  );
}
