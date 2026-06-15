"use client";

import { useProcessMapStore } from "@/store/process-map-store";
import { countBySeverity } from "@/lib/process-map/logic";
import { SeverityBadge } from "@/components/process-map/SeverityBadge";

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-400",
  low: "bg-slate-400",
};

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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text)]">
        <span className="font-medium text-[var(--text-muted)]">Severity:</span>
        {(["critical", "high", "medium", "low"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5 capitalize">
            <span className={`w-2 h-2 rounded-full ${SEVERITY_DOT[s]}`} />
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
            <div key={phase.id} className="section-card overflow-hidden flex flex-col">
              <div className="px-3 py-2.5 section-card-header flex items-baseline justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text)]">
                  {phase.name}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] shrink-0">({pains.length})</p>
              </div>
              <div className="p-3 space-y-3 min-h-[120px] flex-1 bg-[var(--surface-muted)]/40">
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
                      className="border border-[var(--border)] rounded-lg p-3 bg-white shadow-sm cursor-pointer hover:border-[var(--accent)]/35 hover:shadow transition-all"
                      onClick={() => {
                        if (p.processStepIds[0]) {
                          setSelectedStepId(p.processStepIds[0]);
                          setActiveTab("process");
                        }
                      }}
                    >
                      <p className="text-sm font-semibold text-[var(--text)] leading-snug">{p.title}</p>
                      {stepNames.length > 0 && (
                        <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)] font-medium">
                          {stepNames[0]}
                        </span>
                      )}
                      <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">{p.description}</p>
                      {p.evidenceSnippet && (
                        <div className="mt-3 p-2.5 rounded-md bg-blue-50/80 border border-blue-100">
                          <p className="text-[10px] font-semibold text-blue-800 uppercase tracking-wide">
                            Source
                          </p>
                          <p className="text-xs text-slate-700 mt-1 leading-relaxed">{p.evidenceSnippet}</p>
                        </div>
                      )}
                      <div className="mt-3">
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
