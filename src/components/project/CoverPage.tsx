"use client";

import Link from "next/link";
import { ArrowRight, FolderOpen, Sparkles } from "lucide-react";

export function CoverPage() {
  return (
    <main className="cover-page min-h-screen flex flex-col">
      <header className="cover-header">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Internal · Value Creation Platform
            </p>
            <h1 className="text-lg font-semibold text-gradient mt-1">PE Growth Diagnostic</h1>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)]">
            Multi-agent · Process-driven
          </span>
        </div>
      </header>

      <section className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-6 py-16 w-full grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-medium text-[var(--accent)] tracking-wide mb-4">
              Consulting-grade diagnostic workspace
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gradient leading-tight">
              From discovery to sized initiatives — in weeks, not months
            </h2>
            <p className="mt-6 text-lg text-[var(--text-muted)] leading-relaxed max-w-xl">
              A modular multi-agent platform for private equity value creation studies. Scope
              interviews, map processes, synthesize pain points, generate initiatives, and build
              leadership-ready outputs — with human review at every step.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-[var(--text-muted)]">
              <li className="flex gap-2">
                <span className="text-[var(--accent)]">→</span>
                Project-based workspace with separated client studies
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--accent)]">→</span>
                Process-driven agents that hand off structured outputs
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--accent)]">→</span>
                Executive summary dashboard for leadership review
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <Link href="/projects/new" className="cover-action-card group">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Sparkles className="h-6 w-6 text-[var(--accent)] mb-3" />
                  <h3 className="text-xl font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                    Start new project
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                    Create a new client study, configure context, and begin the diagnostic workflow.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0 mt-1" />
              </div>
            </Link>

            <Link href="/projects" className="cover-action-card group">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <FolderOpen className="h-6 w-6 text-[var(--accent-secondary)] mb-3" />
                  <h3 className="text-xl font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                    Open existing project
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                    Resume a saved study with all agent outputs, notes, and version history intact.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0 mt-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-6">
        <p className="text-center text-[10px] text-[var(--text-muted)]">
          Structured for McKinsey-style diagnostics · Human validation required before client delivery
        </p>
      </footer>
    </main>
  );
}
