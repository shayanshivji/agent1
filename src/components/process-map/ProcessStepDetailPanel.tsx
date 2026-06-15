"use client";

import { useProcessMapStore } from "@/store/process-map-store";
import { CONFIDENCE_LABELS } from "@/types/process-map";
import type { StepConfidence } from "@/types/process-map";

export function ProcessStepDetailPanel() {
  const { document, selectedStepId, updateStep } = useProcessMapStore();

  if (!document) {
    return (
      <div className="section-card p-4">
        <p className="text-xs text-[var(--text-muted)] italic">Select a step on the process map.</p>
      </div>
    );
  }

  const step = document.steps.find((s) => s.id === selectedStepId);
  if (!step) {
    return (
      <div className="section-card p-4">
        <p className="text-xs text-[var(--text-muted)] italic">Select a step on the process map.</p>
      </div>
    );
  }

  const actor = document.actors.find((a) => a.id === step.actorId);
  const linkedPains = document.painPoints.filter((p) => step.painPointIds.includes(p.id));
  const phase = document.phases.find((p) => p.id === step.phaseId);

  return (
    <div className="section-card overflow-hidden">
      <div className="px-4 py-3 section-card-header">
        <h3 className="text-sm font-semibold">Step detail</h3>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{phase?.name}</p>
      </div>
      <div className="p-4 space-y-3 text-sm">
        <div>
          <label className="field-label">Step name</label>
          <input
            value={step.name}
            onChange={(e) => updateStep(step.id, { name: e.target.value })}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">Description</label>
          <textarea
            value={step.description}
            onChange={(e) => updateStep(step.id, { description: e.target.value })}
            rows={3}
            className="field-input resize-y"
          />
        </div>
        <div>
          <label className="field-label">Actor</label>
          <select
            value={step.actorId}
            onChange={(e) => updateStep(step.id, { actorId: e.target.value })}
            className="field-input"
          >
            {document.actors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Systems (comma-separated)</label>
          <input
            value={step.systems.join(", ")}
            onChange={(e) =>
              updateStep(step.id, {
                systems: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">Handoff to</label>
          <input
            value={step.handoffTo ?? ""}
            onChange={(e) => updateStep(step.id, { handoffTo: e.target.value || undefined })}
            className="field-input"
            placeholder="Role or team receiving work"
          />
        </div>
        <div>
          <label className="field-label">Confidence</label>
          <select
            value={step.confidence}
            onChange={(e) => updateStep(step.id, { confidence: e.target.value as StepConfidence })}
            className="field-input"
          >
            {Object.entries(CONFIDENCE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        {step.worksWell && (
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[10px] font-semibold text-emerald-400 uppercase">What works well</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{step.worksWell}</p>
          </div>
        )}
        {linkedPains.length > 0 && (
          <div>
            <p className="field-label">Linked pain points</p>
            <ul className="space-y-1 mt-1">
              {linkedPains.map((p) => (
                <li key={p.id} className="text-xs text-[var(--text-muted)]">
                  · {p.title} ({p.severity})
                </li>
              ))}
            </ul>
          </div>
        )}
        {step.evidenceRefs.length > 0 && (
          <div>
            <p className="field-label">Evidence</p>
            <ul className="text-[10px] text-[var(--text-muted)] italic space-y-0.5">
              {step.evidenceRefs.map((ref, i) => (
                <li key={i}>{ref}</li>
              ))}
            </ul>
          </div>
        )}
        {actor && (
          <p className="text-[10px] text-[var(--text-muted)]">
            Swimlane: {actor.name}
          </p>
        )}
      </div>
    </div>
  );
}
