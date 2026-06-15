import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
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
        <section className="hero-panel">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-glow)] bg-[var(--accent-soft)] mb-6">
              <Zap className="h-3 w-3 text-[var(--accent)]" />
              <span className="text-xs font-medium text-[var(--accent)] tracking-wide">
                Agent Blueprint Library · 7 defined
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient leading-tight max-w-3xl">
              One platform for the full diagnostic workflow
            </h1>
            <p className="mt-5 text-lg text-[var(--text-muted)] max-w-2xl leading-relaxed">
              Modular AI agents for PE growth diagnostics — switch via the nav
              above. Scoping Agent is live; the pipeline is ready to extend.
            </p>
            {liveAgent && (
              <Link href={liveAgent.href} className="btn-primary mt-8">
                Launch {liveAgent.shortName} Agent
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-xl font-semibold text-[var(--text)] mb-6">
            Agent roster
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENT_ROSTER.map((agent) => (
              <Link
                key={agent.slug}
                href={agent.href}
                className={`section-card p-5 block group ${
                  agent.status === "live" ? "agent-card-live" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-[var(--accent)]">
                    AGENT_{String(agent.id).padStart(2, "0")}
                  </span>
                  <span
                    className={
                      agent.status === "live" ? "badge-live" : "badge-soon"
                    }
                  >
                    {agent.status}
                  </span>
                </div>
                <h3 className="font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                  {agent.name}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                  {agent.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-[rgba(12,18,32,0.4)]">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-2">
              Scoping Agent — blueprint workflow
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-8 max-w-2xl">
              Steps 4–5 active today. Workflow approval gate ships in a later
              iteration.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {BLUEPRINT_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  {i > 0 && (
                    <span className="text-[var(--border-strong)]">→</span>
                  )}
                  <span
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
                      i >= 3
                        ? "border-[var(--border-glow)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_12px_var(--accent-glow)]"
                        : "border-[var(--border)] text-[var(--text-muted)] bg-[rgba(6,8,15,0.5)]"
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
            <h2 className="text-lg font-semibold text-[var(--text)] mb-3">
              Platform notes
            </h2>
            <ul className="text-sm text-[var(--text-muted)] space-y-2 leading-relaxed list-disc pl-5">
              <li>All agents live in one combinable codebase with horizontal nav.</li>
              <li>Scoping Agent validated against real VB interviews next.</li>
              <li>Industry + function dropdowns — BSN seed or generic templates.</li>
              <li>Export: Markdown, Word, PDF — ready for downstream agents.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
