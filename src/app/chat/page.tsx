import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Paperclip, SendHorizontal, Sparkles } from "lucide-react";

const conversation = [
  { role: "assistant", message: "I can help summarize your latest research and suggest follow-up actions." },
  { role: "user", message: "Summarize the architecture notes from this week." },
];

export default function ChatPage() {
  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Chat history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Launch plan",
              "Customer research",
              "Architecture decisions",
            ].map((topic) => (
              <div key={topic} className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
                {topic}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="flex min-h-[640px] flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI workspace chat</CardTitle>
                <p className="mt-1 text-sm text-slate-500">Grounded answers with citations from your knowledge base.</p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700">Streaming ready</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {conversation.map((item, index) => (
              <div key={`${item.role}-${index}`} className={item.role === "assistant" ? "pr-8" : "pl-8"}>
                <div className={`rounded-3xl p-4 ${item.role === "assistant" ? "bg-slate-50" : "bg-indigo-600 text-white"}`}>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    {item.role === "assistant" ? <Bot className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                    {item.role === "assistant" ? "Assistant" : "You"}
                  </div>
                  <p className="text-sm leading-6">{item.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input placeholder="Ask anything about your workspace..." className="border-0 shadow-none focus:ring-0" />
              <Button size="icon">
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
