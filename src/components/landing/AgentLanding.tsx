import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Layers,
  Sparkles,
} from "lucide-react";
import type { AgentDefinition } from "@/data/agent-roster";
import { AGENT_ROSTER } from "@/data/agent-roster";
import {
  getAgentLandingContent,
  getAgentWorkspaceHref,
} from "@/data/agent-landing-content";
import { PipelineStrip } from "@/components/landing/PipelineStrip";

interface AgentLandingProps {
  agent: AgentDefinition;
}

export function AgentLanding({ agent }: AgentLandingProps) {
  const content = getAgentLandingContent(agent.slug);
  const isLive = agent.status === "live";

  const upstream = content?.upstreamAgents
    .map((id) => AGENT_ROSTER.find((a) => a.id === id))
    .filter(Boolean) as AgentDefinition[];
  const downstream = content?.downstreamAgents
    .map((id) => AGENT_ROSTER.find((a) => a.id === id))
    .filter(Boolean) as AgentDefinition[];

  return (
    <main className="flex-1">
      <section className="agent-hero">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] mb-8 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Platform home
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs font-mono text-[var(--accent)] tracking-wider">
              AGENT_{String(agent.id).padStart(2, "0")}
            </span>
            <span className={isLive ? "badge-live" : "badge-soon"}>{agent.status}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-gradient leading-tight max-w-3xl">
            {agent.name}
          </h1>
          <p className="mt-3 text-lg text-[var(--accent)] font-medium">
            {content?.tagline ?? agent.description}
          </p>
          <p className="mt-4 text-base text-[var(--text-muted)] max-w-2xl leading-relaxed">
            {content?.heroSubtitle ?? agent.blueprintSummary}
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            {isLive ? (
              <Link href={getAgentWorkspaceHref(agent.slug)} className="btn-primary">
                <Sparkles className="h-4 w-4" />
                Launch workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="btn-secondary opacity-60 cursor-not-allowed">
                <Clock className="h-4 w-4" />
                Coming soon
              </span>
            )}
            {isLive && (
              <Link href="/" className="btn-secondary">
                View all agents
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[rgba(12,18,32,0.35)]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
            Pipeline position
          </p>
          <PipelineStrip activeSlug={agent.slug} compact />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-3">The problem</h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              {content?.problemStatement ?? agent.description}
            </p>

            {content?.capabilities && (
              <>
                <h2 className="text-lg font-semibold text-[var(--text)] mt-8 mb-3">
                  What this agent does
                </h2>
                <ul className="space-y-2">
                  {content.capabilities.map((cap) => (
                    <li
                      key={cap}
                      className="flex gap-2 text-sm text-[var(--text-muted)] leading-relaxed"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" />
                      {cap}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="section-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-sm font-semibold text-[var(--text)]">Inputs</h3>
              </div>
              <ul className="text-sm text-[var(--text-muted)] space-y-1.5">
                {(content?.inputs ?? ["Engagement context"]).map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
            </div>

            <div className="section-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Download className="h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-sm font-semibold text-[var(--text)]">Outputs</h3>
              </div>
              <ul className="text-sm text-[var(--text-muted)] space-y-1.5">
                {(content?.outputs ?? ["Structured handoff"]).map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
              {content?.exportFormats && (
                <p className="text-[10px] text-[var(--accent)] mt-3 font-mono">
                  Export: {content.exportFormats.join(" · ")}
                </p>
              )}
            </div>

            {(upstream.length > 0 || downstream.length > 0) && (
              <div className="section-card p-5">
                <h3 className="text-sm font-semibold text-[var(--text)] mb-3">
                  Pipeline handoffs
                </h3>
                {upstream.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
                      Receives from
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {upstream.map((a) => (
                        <Link
                          key={a.slug}
                          href={a.href}
                          className="text-xs px-2 py-1 rounded border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                        >
                          {a.shortName}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {downstream.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
                      Feeds into
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {downstream.map((a) => (
                        <Link
                          key={a.slug}
                          href={a.href}
                          className="text-xs px-2 py-1 rounded border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                        >
                          {a.shortName}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {isLive && (
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="section-card p-8 text-center agent-card-live">
            <h2 className="text-xl font-semibold text-gradient mb-2">Ready to run</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md mx-auto">
              Open the workspace to configure, generate, edit, and export, standalone or as
              part of the diagnostic pipeline.
            </p>
            <Link href={getAgentWorkspaceHref(agent.slug)} className="btn-primary">
              Open {agent.shortName} workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
