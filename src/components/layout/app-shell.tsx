"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Compass,
  FileText,
  Home,
  Inbox,
  Layers,
  Menu,
  Search,
  Settings,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/chat", label: "AI Chat", icon: Bot },
  { href: "/search", label: "Search", icon: Search },
  { href: "/collections", label: "Collections", icon: Layers },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/notes", label: "Notes", icon: Compass },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 lg:px-6">
        <header className="mb-4 flex items-center justify-between rounded-3xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Second Brain AI</p>
              <p className="text-xs text-slate-500">AI-powered knowledge workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Inbox className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="hidden md:flex">
              <UserCircle2 className="mr-2 h-4 w-4" />
              Maya Chen
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="flex flex-1 gap-4">
          <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-200/80 bg-white/75 p-4 shadow-sm backdrop-blur lg:block">
            <nav className="space-y-1">
              {navigation.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <Link key={href} href={href} className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                    active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700",
                  )}>
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-8 rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-sm font-semibold">New AI workflow</p>
              <p className="mt-1 text-sm text-slate-300">Create a focused workspace for your latest research sprint.</p>
              <Button className="mt-4 w-full">Open workspace</Button>
            </div>
          </aside>

          <div className="flex-1">
            {isOpen && (
              <div className="mb-4 rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm lg:hidden">
                <nav className="space-y-1">
                  {navigation.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700" onClick={() => setIsOpen(false)}>
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
