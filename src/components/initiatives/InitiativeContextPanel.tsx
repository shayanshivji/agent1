"use client";

import { useInitiativeStore } from "@/store/initiative-store";

export function InitiativeContextPanel() {
  const {
    inputMode,
    customNotes,
    pipelinePayload,
    processMapText,
    setCustomNotes,
    setPipelinePayload,
    setProcessMapText,
  } = useInitiativeStore();

  return (
    <div className="section-card overflow-hidden">
      <div className="px-4 py-3 section-card-header">
        <h2 className="text-sm font-semibold text-[var(--text)]">Process context</h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Optional notes, pipeline JSON, or pasted maps
        </p>
      </div>
      <div className="p-4 space-y-4">
        {inputMode === "pipeline" && (
          <div>
            <label className="field-label">Pipeline JSON (Agents 1–3)</label>
            <textarea
              value={pipelinePayload}
              onChange={(e) => setPipelinePayload(e.target.value)}
              placeholder='{ "processSteps": [...], "painPoints": [...] }'
              rows={5}
              className="field-input font-mono text-xs resize-y"
            />
          </div>
        )}
        <div>
          <label className="field-label">Process map / transcript excerpts</label>
          <textarea
            value={processMapText}
            onChange={(e) => setProcessMapText(e.target.value)}
            placeholder="Paste process map, interview notes, or pain point list…"
            rows={4}
            className="field-input resize-y"
          />
        </div>
        <div>
          <label className="field-label">Instructions</label>
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="Strategic priorities, in-flight programs to flag…"
            rows={3}
            className="field-input resize-y"
          />
        </div>
      </div>
    </div>
  );
}
