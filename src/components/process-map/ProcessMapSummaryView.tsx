"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { useProcessMapStore } from "@/store/process-map-store";
import { countBySeverity } from "@/lib/process-map/logic";
import { IMPROVEMENT_BUCKET_LABELS } from "@/types/process-map";
import { SeverityBadge } from "@/components/process-map/SeverityBadge";

export function ProcessMapSummaryView() {
  const { document, setActiveTab } = useProcessMapStore();
  const [narrativeOpen, setNarrativeOpen] = useState(false);

  if (!document) return null;

  const severity = countBySeverity(document.painPoints);
  const highOrCritical = severity.critical + severity.high;
  const topPains = [...document.painPoints]
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.severity] - order[b.severity];
    })
    .slice(0, 3);
  const topImprovements = [...document.improvements]
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 3);

  const maxImpact = document.improvements.reduce((max, imp) => {
    const match = imp.impactRange?.match(/(\d+)/g);
    if (!match) return max;
    const nums = match.map(Number);
    return Math.max(max, ...nums);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="section-card p-4">
        <h2 className="text-xl font-semibold text-[var(--text)]">{document.workflowName}</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">{document.purpose}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Steps" value={document.steps.length} sub={`Across ${document.phases.length} phases`} />
        <MetricCard label="Actors" value={document.actors.length} sub="Roles & systems involved" />
        <MetricCard
          label="Pain points"
          value={document.painPoints.length}
          sub={highOrCritical ? `${highOrCritical} high or critical` : "None critical"}
          accent={highOrCritical > 0 ? "warning" : undefined}
        />
        <MetricCard
          label="Improvements"
          value={document.improvements.length}
          sub={maxImpact ? `Up to ${maxImpact}% potential gain` : "Opportunities identified"}
          accent="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="section-card overflow-hidden">
          <div className="px-4 py-3 section-card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold">Top pain points</h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("pain")}
              className="text-xs text-[var(--accent)] hover:underline"
            >
              View all
            </button>
          </div>
          <div className="p-4 space-y-3">
            {topPains.map((p) => (
              <div key={p.id} className="border border-[var(--border)] rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--text)]">{p.title}</p>
                  <SeverityBadge severity={p.severity} />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{p.description}</p>
              </div>
            ))}
            {!topPains.length && (
              <p className="text-xs text-[var(--text-muted)] italic">No pain points identified.</p>
            )}
          </div>
        </div>

        <div className="section-card overflow-hidden">
          <div className="px-4 py-3 section-card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold">Top opportunities</h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("improvements")}
              className="text-xs text-[var(--accent)] hover:underline"
            >
              View all
            </button>
          </div>
          <div className="p-4 space-y-3">
            {topImprovements.map((imp) => (
              <div key={imp.id} className="border border-[var(--border)] rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--text)]">{imp.title}</p>
                  {imp.impactRange && (
                    <span className="text-xs font-semibold text-emerald-700 shrink-0">
                      {imp.impactRange}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{imp.description}</p>
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)]">
                  {IMPROVEMENT_BUCKET_LABELS[imp.bucket]}
                </span>
              </div>
            ))}
            {!topImprovements.length && (
              <p className="text-xs text-[var(--text-muted)] italic">No improvements identified.</p>
            )}
          </div>
        </div>
      </div>

      {document.openQuestions.length > 0 && (
        <div className="section-card p-4">
          <h3 className="text-sm font-semibold mb-2">Open validation questions</h3>
          <ul className="text-xs text-[var(--text-muted)] space-y-1 list-disc pl-4">
            {document.openQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="section-card overflow-hidden">
        <button
          type="button"
          onClick={() => setNarrativeOpen(!narrativeOpen)}
          className="w-full px-4 py-3 flex items-center justify-between section-card-header"
        >
          <span className="text-sm font-semibold">Full narrative summary</span>
          <span className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            ~{document.narrativeSummary.split(/\s+/).length} words
            {narrativeOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </button>
        {narrativeOpen && (
          <div className="p-4 text-sm text-[var(--text-muted)] whitespace-pre-wrap border-t border-[var(--border)]">
            {document.narrativeSummary}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  accent?: "warning" | "success";
}) {
  return (
    <div className="section-card p-4">
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p
        className={`text-3xl font-bold mt-1 ${
          accent === "warning" ? "text-amber-600" : accent === "success" ? "text-emerald-700" : "text-[var(--text)]"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>
    </div>
  );
}
