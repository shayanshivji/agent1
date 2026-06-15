import Link from "next/link";
import {
  ArrowRight,
  GitBranch,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { AGENT_ROSTER, getLiveAgents } from "@/data/agent-roster";
import { PLATFORM_STATS } from "@/data/agent-landing-content";
import { PipelineStrip } from "@/components/landing/PipelineStrip";

export function PlatformLanding() {
  const liveAgents = getLiveAgents();

  return (
    <main className="flex-1">
      <section className="landing-hero">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-glow)] bg-[var(--accent-soft)] mb-6">
            <Zap className="h-3 w-3 text-[var(--accent)]" />
            <span className="text-xs font-medium text-[var(--accent)] tracking-wide">
              Blue Currency · Agent OS · PE Growth Diagnostic
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gradient leading-[1.1] max-w-4xl">
            Compress the McKinsey diagnostic into weeks — not months
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Seven modular AI agents on one platform. Scope interviews, map processes,
            generate initiatives, and hand off structured JSON to value modeling and
            roadmapping — with human review at every step.
          </p>

          <div className="flex flex-wrap gap-3 mt-10">
            {liveAgents[0] && (
              <Link href={liveAgents[0].href} className="btn-primary">
                <Sparkles className="h-4 w-4" />
                Start with {liveAgents[0].shortName}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <a href="#agents" className="btn-secondary">
              Explore all agents
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
            <div className="landing-stat">
              <p className="landing-stat-value">{PLATFORM_STATS.totalAgents}</p>
              <p className="landing-stat-label">Agents in pipeline</p>
            </div>
            <div className="landing-stat">
              <p className="landing-stat-value text-[var(--success)]">
                {liveAgents.length}
              </p>
              <p className="landing-stat-label">Live today</p>
            </div>
            <div className="landing-stat">
              <p className="landing-stat-value">~{PLATFORM_STATS.diagnosticWeeks}</p>
              <p className="landing-stat-label">Week target cycle</p>
            </div>
            <div className="landing-stat">
              <p className="landing-stat-value text-sm font-mono pt-1">
                {PLATFORM_STATS.exportFormats}
              </p>
              <p className="landing-stat-label">Export formats</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[rgba(12,18,32,0.4)]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-[var(--text)]">
              End-to-end diagnostic pipeline
            </h2>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-8 max-w-2xl">
            Each agent works standalone or as a downstream component. Structured handoffs
            keep the fact base consistent from scoping through BRD.
          </p>
          <PipelineStrip />
        </div>
      </section>

      <section id="agents" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold text-[var(--text)] mb-2">Agent roster</h2>
        <p className="text-sm text-[var(--text-muted)] mb-8 max-w-xl">
          Click any agent for a dedicated overview — capabilities, inputs, outputs, and
          pipeline position.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {AGENT_ROSTER.map((agent) => (
            <Link
              key={agent.slug}
              href={agent.href}
              className={`landing-agent-card group ${agent.status === "live" ? "agent-card-live" : ""}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[var(--accent)]">
                  {String(agent.id).padStart(2, "0")}
                </span>
                <span className={agent.status === "live" ? "badge-live" : "badge-soon"}>
                  {agent.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                {agent.name}
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed line-clamp-3">
                {agent.description}
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-[var(--accent)] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                View agent <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
          <div className="section-card p-6">
            <Layers className="h-5 w-5 text-[var(--accent)] mb-3" />
            <h3 className="font-semibold text-[var(--text)] mb-2">Standalone or pipeline</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Run any agent with manual inputs, or paste structured JSON from upstream
              agents. No prior output required to start.
            </p>
          </div>
          <div className="section-card p-6">
            <Sparkles className="h-5 w-5 text-[var(--accent)] mb-3" />
            <h3 className="font-semibold text-[var(--text)] mb-2">Consulting-grade structure</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              McKinsey two-lens framing, fact-base requirements, and export formats
              designed for client delivery — not generic chat output.
            </p>
          </div>
          <div className="section-card p-6">
            <GitBranch className="h-5 w-5 text-[var(--accent)] mb-3" />
            <h3 className="font-semibold text-[var(--text)] mb-2">Human review built in</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Every output is editable before export. Agents accelerate the work; your team
              validates before field use.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-gradient mb-3">
            Start the diagnostic
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            {liveAgents.length} agents live · BSN seeds included · Generic templates for any industry
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {liveAgents.map((agent) => (
              <Link key={agent.slug} href={agent.href} className="btn-primary">
                {agent.shortName}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
