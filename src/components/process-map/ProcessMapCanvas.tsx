"use client";

import { AlertTriangle } from "lucide-react";
import { useProcessMapStore } from "@/store/process-map-store";
import { CONFIDENCE_LABELS } from "@/types/process-map";

export function ProcessMapCanvas() {
  const { document, selectedStepId, setSelectedStepId, selectedPhaseId, setSelectedPhaseId } =
    useProcessMapStore();

  if (!document) return null;

  const phases = [...document.phases].sort((a, b) => a.order - b.order);
  const filteredPhase = selectedPhaseId;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[var(--text-muted)]">
          Click a step to inspect details. Yellow markers indicate linked pain points.
        </p>
        {filteredPhase && (
          <button
            type="button"
            onClick={() => setSelectedPhaseId(null)}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            Clear phase filter
          </button>
        )}
      </div>

      <div className="section-card overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Phase headers */}
          <div
            className="grid border-b border-[var(--border)]"
            style={{ gridTemplateColumns: `140px repeat(${phases.length}, 1fr)` }}
          >
            <div className="p-2 bg-[var(--surface-muted)]" />
            {phases.map((phase) => {
              const count = document.steps.filter((s) => s.phaseId === phase.id).length;
              const painCount = document.painPoints.filter((p) => p.phaseId === phase.id).length;
              return (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() =>
                    setSelectedPhaseId(selectedPhaseId === phase.id ? null : phase.id)
                  }
                  className={`p-3 text-left border-l border-[var(--border)] transition-colors ${
                    selectedPhaseId === phase.id ? "bg-[var(--accent)]/10" : "bg-white hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {phase.name}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {count} steps{painCount ? ` · ${painCount} pains` : ""}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Swimlanes by actor */}
          {document.actors.map((actor) => {
            const actorSteps = document.steps.filter((s) => s.actorId === actor.id);
            if (!actorSteps.length) return null;

            return (
              <div
                key={actor.id}
                className="grid border-b border-[var(--border)] last:border-b-0"
                style={{ gridTemplateColumns: `140px repeat(${phases.length}, 1fr)` }}
              >
                <div
                  className="p-3 flex flex-col justify-center border-r border-[var(--border)]"
                  style={{ borderLeftColor: actor.color, borderLeftWidth: 4 }}
                >
                  <p className="text-xs font-semibold text-[var(--text)]">{actor.shortLabel ?? actor.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5 line-clamp-2">{actor.name}</p>
                </div>

                {phases.map((phase) => {
                  const steps = actorSteps
                    .filter((s) => s.phaseId === phase.id)
                    .filter((s) => !filteredPhase || s.phaseId === filteredPhase)
                    .sort((a, b) => a.order - b.order);

                  return (
                    <div
                      key={phase.id}
                      className="p-2 border-l border-[var(--border)] min-h-[100px] flex flex-col gap-2"
                    >
                      {steps.map((step) => {
                        const hasPain = step.painPointIds.length > 0;
                        const isSelected = selectedStepId === step.id;
                        return (
                          <button
                            key={step.id}
                            type="button"
                            onClick={() => setSelectedStepId(step.id)}
                            className={`text-left rounded-lg border p-2.5 transition-all ${
                              isSelected
                                ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-sm"
                                : "border-[var(--border)] bg-white hover:border-[var(--border-strong)] hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <p className="text-xs font-semibold text-[var(--text)] leading-tight">
                                {step.name}
                              </p>
                              {hasPain && (
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] mt-1 line-clamp-2">
                              {step.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {step.systems.slice(0, 2).map((sys) => (
                                <span
                                  key={sys}
                                  className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--text-muted)]"
                                >
                                  {sys}
                                </span>
                              ))}
                              {step.frequency && (
                                <span className="text-[9px] text-[var(--text-muted)]">
                                  {step.frequency}
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-[var(--text-muted)] mt-1">
                              {CONFIDENCE_LABELS[step.confidence]}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {document.alternateFlows.length > 0 && (
        <div className="section-card p-4">
          <h3 className="text-sm font-semibold mb-2">Alternate / exception paths</h3>
          <div className="space-y-2">
            {document.alternateFlows.map((flow) => (
              <div key={flow.id} className="text-xs border border-[var(--border)] rounded p-2">
                <p className="font-medium text-[var(--text)]">{flow.name}</p>
                <p className="text-[var(--text-muted)] mt-0.5">{flow.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
