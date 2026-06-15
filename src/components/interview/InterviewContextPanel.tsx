"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useInterviewStore } from "@/store/interview-execution-store";

export function InterviewContextPanel() {
  const {
    mode,
    customNotes,
    guidePayload,
    guideSource,
    linkedGuideId,
    transcriptText,
    setCustomNotes,
    setGuidePayload,
    setTranscriptText,
  } = useInterviewStore();

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const guideLoaded = Boolean(guidePayload.trim() && linkedGuideId);

  return (
    <div className="space-y-4">
      {mode === "live" && guideLoaded && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
          Interview guide loaded from Scoping Agent — use the question list in live chat above.
          {guideSource === "scoping" && (
            <span className="block mt-0.5 text-emerald-700/80">
              No need to edit JSON unless you are troubleshooting an import.
            </span>
          )}
        </div>
      )}

      {mode === "live" && !guideLoaded && !guidePayload.trim() && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-xs text-[var(--text-muted)]">
          No guide loaded yet. Use the upstream banner to pull from Scoping, or expand Advanced to paste guide JSON.
        </div>
      )}

      <div className="section-card overflow-hidden">
        <div className="px-4 py-3 section-card-header">
          <h2 className="text-sm font-semibold text-[var(--text)]">Session notes</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Optional — focus areas, contradictions to probe, validation priorities
          </p>
        </div>
        <div className="p-4">
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="e.g. Probe Engage queue rework, validate Fall peak volume assumptions…"
            rows={3}
            className="field-input resize-y text-sm"
          />
        </div>
      </div>

      {mode === "transcript" && (
        <div className="section-card overflow-hidden">
          <div className="px-4 py-3 section-card-header">
            <h2 className="text-sm font-semibold text-[var(--text)]">Transcript / meeting notes</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Paste the full interview transcript or exported notes
            </p>
          </div>
          <div className="p-4">
            <textarea
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Paste full transcript, OneNote export, or interview notes…"
              rows={10}
              className="field-input resize-y font-mono text-xs"
            />
          </div>
        </div>
      )}

      <div className="section-card overflow-hidden">
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="w-full px-4 py-3 flex items-center justify-between section-card-header text-left"
        >
          <div>
            <h2 className="text-sm font-semibold text-[var(--text)]">Advanced</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Manual guide JSON — only if Scoping handoff did not load
            </p>
          </div>
          {advancedOpen ? (
            <ChevronUp className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
          )}
        </button>
        {advancedOpen && (
          <div className="p-4 border-t border-[var(--border)]">
            <label className="field-label">Interview guide JSON (Agent 1)</label>
            <textarea
              value={guidePayload}
              onChange={(e) => setGuidePayload(e.target.value)}
              placeholder='Paste guide export or { "guide": { "sections": [...] } }'
              rows={8}
              className="field-input font-mono text-xs resize-y mt-1"
            />
          </div>
        )}
      </div>
    </div>
  );
}
