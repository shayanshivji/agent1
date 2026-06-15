import Link from "next/link";
import { AGENT_ROSTER } from "@/data/agent-roster";
import { PLATFORM_PIPELINE } from "@/data/agent-landing-content";

interface PipelineStripProps {
  activeSlug?: string;
  compact?: boolean;
}

export function PipelineStrip({ activeSlug, compact }: PipelineStripProps) {
  return (
    <div className={`pipeline-strip ${compact ? "pipeline-strip-compact" : ""}`}>
      {PLATFORM_PIPELINE.map((step, i) => {
        const agent = AGENT_ROSTER.find((a) => a.slug === step.slug);
        const isActive = activeSlug === step.slug;
        const isLive = agent?.status === "live";

        return (
          <div key={step.id} className="flex items-center gap-2">
            {i > 0 && <span className="pipeline-arrow" aria-hidden>→</span>}
            <Link
              href={agent?.href ?? "#"}
              className={`pipeline-node ${isActive ? "pipeline-node-active" : ""} ${
                isLive ? "pipeline-node-live" : ""
              }`}
            >
              <span className="pipeline-node-id">{String(step.id).padStart(2, "0")}</span>
              <span className="pipeline-node-label">{step.label}</span>
              {isLive && <span className="pipeline-node-dot" />}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
