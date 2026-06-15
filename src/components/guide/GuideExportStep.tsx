"use client";

import { ExportBar } from "@/components/guide/ExportBar";
import { useGuideStore } from "@/store/guide-store";

export function GuideExportStep() {
  const guide = useGuideStore((s) => s.guide);

  if (!guide) {
    return (
      <div className="section-card p-12 text-center text-sm text-[var(--text-muted)]">
        Complete Step 2 before exporting.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[var(--text)]">Export interview guide</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Download the validated guide for field use or hand off to Walter (Agent 2).
        </p>
      </div>

      <div className="section-card p-5 mb-6">
        <p className="text-sm font-medium text-[var(--text)]">{guide.workflowName}</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {guide.roleName} · Status: {guide.reviewStatus.replace("_", " ")}
        </p>
      </div>

      <ExportBar />
    </div>
  );
}
