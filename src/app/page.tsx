import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PlatformHeader } from "@/components/layout/PlatformHeader";
import { AgentTopNav } from "@/components/layout/AgentTopNav";
import { AGENT_ROSTER } from "@/data/agent-roster";

const BLUEPRINT_STEPS = [
  "Ingest context",
  "Pull workflows",
  "Human approval",
  "Build interview guide",
  "Output fact-base",
];

export default function HomePage() {
  const liveAgent = AGENT_ROSTER.find((a) => a.status === "live");

  return (
    <div className="min-h-screen flex flex-col">
      <PlatformHeader />
      <AgentTopNav />

      <main className="flex-1">
        <section className="bg-white border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-6 py-14 md:py-18">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
              Agent Blueprint Library · 7 defined agents
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[var(--mck-navy)] leading-tight max-w-3xl">
              One platform for the full diagnostic workflow
            </h1>
            <p className="mt-4 text-lg text-[var(--text-muted)] max-w-2xl leading-relaxed">
              Each agent is a module in this codebase — switch via the horizontal
              nav above. Agent 1 (Scoping) is live; others are placeholders ready
              for incremental builds.
            </p>
            {liveAgent && (
              <Link
                href={liveAgent.href}
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-[var(--mck-navy)] text-white text-sm font-semibold rounded-md hover:opacity-90"
              >
                Open {liveAgent.shortName} Agent
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-xl font-semibold text-[var(--mck-navy)] mb-6">
            Agent roster
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENT_ROSTER.map((agent) => (
              <Link
                key={agent.slug}
                href={agent.href}
                className={`section-card p-5 block transition-shadow hover:shadow-md ${
                  agent.status === "live" ? "ring-2 ring-[var(--accent)] ring-offset-2" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[var(--text-muted)]">
                    Agent {agent.id}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      agent.status === "live"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-[var(--bg)] text-[var(--text-muted)]"
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>
                <h3 className="font-semibold text-[var(--mck-navy)]">
                  {agent.name}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
                  {agent.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-white border-y border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <h2 className="text-xl font-semibold text-[var(--mck-navy)] mb-2">
              Scoping Agent — blueprint workflow
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-8 max-w-2xl">
              Aligned to the Agent Blueprint Library. Current build covers steps 4–5
              (interview guide + fact-base). Workflow approval gate comes in a
              later iteration.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {BLUEPRINT_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  {i > 0 && (
                    <span className="text-[var(--text-muted)]">→</span>
                  )}
                  <span
                    className={`text-xs px-3 py-1.5 rounded-md border ${
                      i >= 3
                        ? "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--mck-blue)] font-medium"
                        : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)]"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="section-card p-6">
            <h2 className="text-lg font-semibold text-[var(--mck-navy)] mb-2">
              From today&apos;s sync
            </h2>
            <ul className="text-sm text-[var(--text-muted)] space-y-2 leading-relaxed list-disc pl-5">
              <li>
                Keep all agents in one platform — horizontal nav for switching
                (per Emmanuel).
              </li>
              <li>
                Agent 1 first; validate with Emmanuel using a real VB interview
                before building Agent 4 (Initiatives).
              </li>
              <li>
                Do not combine Walter (Agent 2) with Scoping for now.
              </li>
              <li>
                Eventually generalize dropdowns (industry, function) — BSN-specific
                seed is fine for BC.
              </li>
              <li>
                Export targets: Word, PDF, or ingest into next agent — Markdown
                today.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
