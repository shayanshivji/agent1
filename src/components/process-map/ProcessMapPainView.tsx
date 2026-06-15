"use client";

import { useProcessMapStore } from "@/store/process-map-store";
import { countBySeverity } from "@/lib/process-map/logic";

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-500/20 text-red-300",
    high: "bg-orange-500/20 text-orange-300",
    medium: "bg-yellow-500/20 text-yellow-300",
    low: "bg-slate-500/20 text-slate-300",
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${colors[severity] ?? colors.medium}`}>
      {severity}
    </span>
  );
}

export function ProcessMapPainView() {
  const { document, selectedStepId, setSelectedStepId, setActiveTab } = useProcessMapStore();

  if (!document) return null;

  const severity = countBySeverity(document.painPoints);
  const phases = [...document.phases].sort((a, b) => a.order - b.order);

  const filteredPains = selectedStepId
    ? document.painPoints.filter((p) => p.processStepIds.includes(selectedStepId))
    : document.painPoints;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <span className="text-[var(--text-muted)]">Severity:</span>
        {(["critical", "high", "medium", "low"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                s === "critical"
                  ? "bg-red-400"
                  : s === "high"
                    ? "bg-orange-400"
                    : s === "medium"
                      ? "bg-yellow-400"
                      : "bg-slate-400"
              }`}
            />
            {s} ({severity[s]})
          </span>
        ))}
        {selectedStepId && (
          <button
            type="button"
            onClick={() => setSelectedStepId(null)}
            className="text-[var(--accent)] hover:underline ml-auto"
          >
            Clear step filter
          </button>
        )}
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        Click a step on the process map to filter. Severity is set by the AI and editable via refinement.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {phases.map((phase) => {
          const pains = filteredPains.filter((p) => p.phaseId === phase.id);
          return (
            <div key={phase.id} className="section-card overflow-hidden">
              <div className="px-3 py-2 section-card-header">
                <p className="text-[10px] font-bold uppercase tracking-wider">{phase.name}</p>
                <p className="text-[10px] text-[var(--text-muted)]">({pains.length})</p>
              </div>
              <div className="p-3 space-y-3 min-h-[120px]">
                {pains.length === 0 && (
                  <p className="text-xs text-[var(--text-muted)] italic">No pain points in this step.</p>
                )}
                {pains.map((p) => {
                  const stepNames = p.processStepIds
                    .map((id) => document.steps.find((s) => s.id === id)?.name)
                    .filter(Boolean);
                  return (
                    <div
                      key={p.id}
                      className="border border-[var(--border)] rounded-lg p-3 bg-[rgba(6,8,15,0.5)] cursor-pointer hover:border-[var(--border-strong)]"
                      onClick={() => {
                        if (p.processStepIds[0]) {
                          setSelectedStepId(p.processStepIds[0]);
                          setActiveTab("process");
                        }
                      }}
                    >
                      <p className="text-sm font-semibold text-[var(--text)]">{p.title}</p>
                      {stepNames.length > 0 && (
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300">
                          {stepNames[0]}
                        </span>
                      )}
                      <p className="text-xs text-[var(--text-muted)] mt-2">{p.description}</p>
                      <div className="mt-2 p-2 rounded bg-[var(--accent)]/5 border border-[var(--accent)]/20">
                        <p className="text-[10px] font-semibold text-[var(--accent)] uppercase">Source</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 italic">
                          {p.evidenceSnippet}
                        </p>
                      </div>
                      <div className="mt-2">
                        <SeverityBadge severity={p.severity} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
