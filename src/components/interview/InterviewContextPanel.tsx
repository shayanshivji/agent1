"use client";

import { useInterviewStore } from "@/store/interview-execution-store";

export function InterviewContextPanel() {
  const {
    inputMode,
    mode,
    stakeholderName,
    customNotes,
    guidePayload,
    transcriptText,
    setStakeholderName,
    setCustomNotes,
    setGuidePayload,
    setTranscriptText,
  } = useInterviewStore();

  return (
    <div className="section-card overflow-hidden">
      <div className="px-4 py-3 section-card-header">
        <h2 className="text-sm font-semibold text-[var(--text)]">Interview input</h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          {mode === "live" ? "Guide from Agent 1 and session notes" : "Transcript, notes, or guide JSON"}
        </p>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="field-label">Stakeholder name</label>
          <input
            value={stakeholderName}
            onChange={(e) => setStakeholderName(e.target.value)}
            placeholder="SME name for evidence attribution"
            className="field-input"
          />
        </div>
        {(inputMode === "pipeline" || guidePayload) && (
          <div>
            <label className="field-label">Interview guide JSON (Agent 1)</label>
            <textarea
              value={guidePayload}
              onChange={(e) => setGuidePayload(e.target.value)}
              placeholder='Paste guide export or { "guide": { "sections": [...] } }'
              rows={5}
              className="field-input font-mono text-xs resize-y"
            />
          </div>
        )}
        {mode === "transcript" && (
          <div>
            <label className="field-label">Transcript / meeting notes</label>
            <textarea
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Paste full transcript, OneNote export, or interview notes…"
              rows={8}
              className="field-input resize-y font-mono text-xs"
            />
          </div>
        )}
        <div>
          <label className="field-label">Instructions</label>
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="Focus areas, prior contradictions to probe, validation priorities…"
            rows={3}
            className="field-input resize-y"
          />
        </div>
      </div>
    </div>
  );
}
