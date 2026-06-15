"use client";

import { useGuideStore } from "@/store/guide-store";

export function GuideContextPanel() {
  const { customNotes, setCustomNotes } = useGuideStore();

  return (
    <div className="section-card overflow-hidden">
      <div className="px-4 py-3 section-card-header">
        <h2 className="text-sm font-semibold text-[var(--text)]">Instructions</h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Optional focus areas for this interview guide
        </p>
      </div>
      <div className="p-4">
        <textarea
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
          placeholder="e.g. Focus on Fall peak season, probe in-flight NSP initiative…"
          rows={4}
          className="field-input resize-y"
        />
      </div>
    </div>
  );
}
