"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useProcessMapStore } from "@/store/process-map-store";
import type { RefineTarget } from "@/types/process-map";

const REFINE_TARGETS: { value: RefineTarget; label: string }[] = [
  { value: "full_map", label: "Full map" },
  { value: "process_steps", label: "Process steps" },
  { value: "pain_points", label: "Pain points" },
  { value: "improvements", label: "Improvements" },
  { value: "narrative", label: "Narrative summary" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function RefineModal({ open, onClose }: Props) {
  const { document, setDocument, addRefinement, setRefining, isRefining } = useProcessMapStore();
  const [target, setTarget] = useState<RefineTarget>("improvements");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open || !document) return null;

  async function handleSubmit() {
    if (!feedback.trim() || !document) return;
    setRefining(true);
    setError(null);

    try {
      const res = await fetch("/api/refine-process-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document,
          target,
          feedback,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Refinement failed");

      setDocument(data.document);
      addRefinement({
        id: uuidv4(),
        target,
        feedback,
        createdAt: new Date().toISOString(),
      });
      setFeedback("");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refinement failed");
    } finally {
      setRefining(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="section-card w-full max-w-lg shadow-xl">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">Refine with feedback</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              The AI will re-run only the parts you select.
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={isRefining}>
            <X className="h-5 w-5 text-[var(--text-muted)] hover:text-[var(--text)]" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && <div className="error-banner text-xs">{error}</div>}

          <div>
            <label className="field-label">What do you want to refine?</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as RefineTarget)}
              className="field-input"
              disabled={isRefining}
            >
              {REFINE_TARGETS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Your feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Express the savings as ranges instead of a single number; add an org-change opportunity."
              rows={4}
              className="field-input resize-y"
              disabled={isRefining}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setFeedback("")}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
              disabled={isRefining}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isRefining || !feedback.trim()}
              className="btn-primary"
            >
              {isRefining ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send refinement
            </button>
          </div>

          <div className="border-t border-[var(--border)] pt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              History
            </p>
            {document.refinements.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] mt-2 italic">
                No refinements yet. Your changes will appear here.
              </p>
            ) : (
              <ul className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {document.refinements.map((r) => (
                  <li key={r.id} className="text-xs border border-[var(--border)] rounded p-2">
                    <span className="font-medium text-[var(--accent)]">{r.target}</span>
                    <p className="text-[var(--text-muted)] mt-0.5">{r.feedback}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
