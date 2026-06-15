"use client";

import { useProcessMapStore } from "@/store/process-map-store";
import { PipelineValidationBanner } from "@/components/workspace/PipelineValidationBanner";

export function ProcessMapContextPanel() {
  const {
    inputMode,
    workflowId,
    customNotes,
    pipelinePayload,
    pastedNotes,
    setCustomNotes,
    setPipelinePayload,
    setPastedNotes,
  } = useProcessMapStore();

  return (
    <div className="section-card overflow-hidden">
      <div className="px-4 py-3 section-card-header">
        <h2 className="text-sm font-semibold text-[var(--text)]">Process context</h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Paste interview notes, pipeline JSON, or transcript excerpts
        </p>
      </div>
      <div className="p-4 space-y-4">
        {inputMode === "pipeline" && (
          <div>
            <label className="field-label">Pipeline JSON (Agents 1–2)</label>
            <PipelineValidationBanner payload={pipelinePayload} workflowId={workflowId} />
            <textarea
              value={pipelinePayload}
              onChange={(e) => setPipelinePayload(e.target.value)}
              placeholder='{ "processSteps": [...], "painPoints": [...], "interviewNotes": "..." }'
              rows={5}
              className="field-input font-mono text-xs resize-y"
            />
          </div>
        )}
        <div>
          <label className="field-label">Interview notes / transcript excerpts</label>
          <textarea
            value={pastedNotes}
            onChange={(e) => setPastedNotes(e.target.value)}
            placeholder="Paste raw interview notes, walkthrough transcripts, or SME comments…"
            rows={5}
            className="field-input resize-y"
          />
        </div>
        <div>
          <label className="field-label">Instructions</label>
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="Focus areas, in-flight programs to flag, SME names…"
            rows={3}
            className="field-input resize-y"
          />
        </div>
      </div>
    </div>
  );
}
