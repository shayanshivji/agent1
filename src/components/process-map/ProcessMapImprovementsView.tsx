"use client";

import { useProcessMapStore } from "@/store/process-map-store";
import { IMPROVEMENT_BUCKET_LABELS } from "@/types/process-map";

const BUCKET_COLORS: Record<string, string> = {
  simplify: "bg-blue-50 text-blue-700 border-blue-200",
  automate: "bg-purple-50 text-purple-700 border-purple-200",
  digitize: "bg-cyan-50 text-cyan-700 border-cyan-200",
  consolidate: "bg-amber-50 text-amber-800 border-amber-200",
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
                  <span className="text-sm font-bold text-emerald-700 shrink-0">{imp.impactRange}</span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">{imp.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`text-[10px] px-2 py-0.5 rounded border ${BUCKET_COLORS[imp.bucket]}`}>
                  {IMPROVEMENT_BUCKET_LABELS[imp.bucket]}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--text-muted)] uppercase font-medium">
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
