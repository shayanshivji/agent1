"use client";

import Link from "next/link";
import { ArrowRight, FolderOpen, Sparkles } from "lucide-react";
import { CoverBanner } from "@/components/project/CoverBanner";
import { OpenDemoProjectCard } from "@/components/project/OpenDemoProjectCard";

export function CoverPage() {
  return (
    <main className="cover-page min-h-screen flex flex-col">
      <CoverBanner />

      <section className="flex-1 flex items-center justify-center py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 w-full text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-semibold text-[var(--mck-navy)] tracking-tight leading-tight">
            Agentified Value Creation Platform
          </h1>
          <p className="mt-5 text-lg md:text-xl font-medium text-[var(--text)]">
            What would you like to work on today?
          </p>
          <p className="mt-3 text-sm md:text-base text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Scope interviews, map current state, synthesize pain points, and generate initiatives —
            project-based, with human review at every value creation step.
          </p>

          <div className="mt-10 md:mt-12 grid sm:grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-5xl mx-auto">
            <OpenDemoProjectCard />

            <Link href="/projects/new" className="cover-action-card group h-full">
              <Sparkles className="h-5 w-5 text-[var(--accent)] mb-3" />
              <h3 className="text-base font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                Start new project
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                Create a client study and begin the value creation workflow.
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
