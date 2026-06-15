"use client";

import { useInterviewStore } from "@/store/interview-execution-store";
import type { InterviewTab } from "@/types/interview-execution";

const TABS: { id: InterviewTab; label: string }[] = [
  { id: "transcript", label: "Transcript" },
  { id: "summary", label: "Summary" },
  { id: "workflow", label: "Workflow Steps" },
  { id: "pain", label: "Pain Points" },
  { id: "evidence", label: "Evidence" },
  { id: "handoffs", label: "Handoffs" },
  { id: "open_questions", label: "Open Questions" },
  { id: "coverage", label: "Coverage" },
  { id: "export", label: "Export" },
];

export function InterviewTabs() {
  const { document, activeTab, setActiveTab } = useInterviewStore();
  if (!document) return null;

  const counts: Partial<Record<InterviewTab, number>> = {
    workflow: document.workflowSteps.length,
    pain: document.painPoints.length,
    evidence: document.evidenceRegistry.length,
    handoffs: document.handoffs.length,
    open_questions: document.openQuestions.length,
  };

  return (
    <div className="flex overflow-x-auto border-b border-[var(--border)] mb-4">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setActiveTab(t.id)}
          className={`shrink-0 px-3 py-2.5 text-xs font-medium transition-colors ${
            activeTab === t.id
              ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          {t.label}
          {counts[t.id] !== undefined && (
            <span className="ml-1 opacity-70">({counts[t.id]})</span>
          )}
        </button>
      ))}
    </div>
  );
}
