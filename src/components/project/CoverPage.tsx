"use client";

import Link from "next/link";
import { ArrowRight, FolderOpen, Sparkles } from "lucide-react";
import { OpenDemoProjectCard } from "@/components/project/OpenDemoProjectCard";

export function CoverPage() {
  return (
    <main className="cover-page min-h-screen flex flex-col">
      <section className="flex-1 flex items-center justify-center py-16">
        <div className="max-w-4xl mx-auto px-6 w-full text-center">
          <p className="text-sm text-[var(--text-muted)] mb-3">Value creation diagnostic platform</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-[var(--mck-navy)] tracking-tight leading-tight">
            What would you like to work on today?
          </h1>
          <p className="mt-4 text-base text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Scope interviews, map processes, and generate initiatives — project-based, with human
            review at every step.
          </p>

          <div className="mt-12 grid sm:grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-5xl mx-auto">
            <OpenDemoProjectCard />

            <Link href="/projects/new" className="cover-action-card group h-full">
              <Sparkles className="h-5 w-5 text-[var(--accent)] mb-3" />
              <h3 className="text-base font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                Start new project
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                Create a client study and begin the diagnostic workflow.
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-[var(--accent)] mt-4 font-medium">
                Create
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            <Link href="/projects" className="cover-action-card group h-full">
              <FolderOpen className="h-5 w-5 text-[var(--accent)] mb-3" />
              <h3 className="text-base font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                Open existing project
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                Resume a saved study with outputs and feedback history.
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-[var(--accent)] mt-4 font-medium">
                Browse
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
