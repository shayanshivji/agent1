"use client";

import { useProcessMapStore } from "@/store/process-map-store";
import { IMPROVEMENT_BUCKET_LABELS } from "@/types/process-map";

const BUCKET_COLORS: Record<string, string> = {
  simplify: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  automate: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  digitize: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  consolidate: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export function ProcessMapImprovementsView() {
  const { document } = useProcessMapStore();
  if (!document) return null;

  const buckets = ["simplify", "automate", "digitize", "consolidate"] as const;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {buckets.map((b) => {
          const count = document.improvements.filter((i) => i.bucket === b).length;
          return (
            <span
              key={b}
              className={`text-xs px-3 py-1 rounded-full border ${BUCKET_COLORS[b]}`}
            >
              {IMPROVEMENT_BUCKET_LABELS[b]} ({count})
            </span>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {document.improvements.map((imp) => {
          const linkedSteps = imp.processStepIds
            .map((id) => document.steps.find((s) => s.id === id)?.name)
            .filter(Boolean);
          const linkedPains = imp.painPointIds
            .map((id) => document.painPoints.find((p) => p.id === id)?.title)
            .filter(Boolean);

          return (
            <div key={imp.id} className="section-card p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-[var(--text)]">{imp.title}</h3>
                {imp.impactRange && (
                  <span className="text-sm font-bold text-emerald-400 shrink-0">{imp.impactRange}</span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">{imp.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`text-[10px] px-2 py-0.5 rounded border ${BUCKET_COLORS[imp.bucket]}`}>
                  {IMPROVEMENT_BUCKET_LABELS[imp.bucket]}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 uppercase">
                  {imp.priority} priority
                </span>
              </div>
              {linkedSteps.length > 0 && (
                <p className="text-[10px] text-[var(--text-muted)] mt-2">
                  Steps: {linkedSteps.join(", ")}
                </p>
              )}
              {linkedPains.length > 0 && (
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Addresses: {linkedPains.join("; ")}
                </p>
              )}
            </div>
          );
        })}
        {!document.improvements.length && (
          <p className="text-xs text-[var(--text-muted)] italic col-span-2">
            No improvement opportunities identified.
          </p>
        )}
      </div>

      {document.inFlightInitiatives.length > 0 && (
        <div className="section-card p-4">
          <h3 className="text-sm font-semibold mb-3">In-flight initiatives</h3>
          <div className="space-y-2">
            {document.inFlightInitiatives.map((init) => (
              <div key={init.id} className="border border-[var(--border)] rounded p-3 text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[var(--text)]">{init.title}</p>
                  <span className="text-[10px] uppercase text-[var(--accent)]">{init.status.replace("_", " ")}</span>
                </div>
                {init.note && <p className="text-[var(--text-muted)] mt-1">{init.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
