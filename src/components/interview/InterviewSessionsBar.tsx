"use client";

import { Plus, Trash2, UserRound } from "lucide-react";
import { useInterviewStore } from "@/store/interview-execution-store";
import { ensureRuns } from "@/lib/interview-execution/runs";

export function InterviewSessionsBar() {
  const {
    interviewRuns,
    activeRunId,
    createInterview,
    switchInterview,
    deleteInterview,
  } = useInterviewStore();

  const runs =
    interviewRuns.length > 0
      ? interviewRuns
      : ensureRuns(useInterviewStore.getState()).interviewRuns;

  return (
    <div className="section-card p-3 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--text)]">Interviews</p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Run separate sessions for each SME — switch tabs to capture and process individually.
          </p>
        </div>
        <button type="button" onClick={() => createInterview()} className="btn-primary text-xs shrink-0">
          <Plus className="h-3.5 w-3.5" />
          Add interview
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {runs.map((run) => {
          const active = run.id === activeRunId;
          const hasOutput = Boolean(run.document);
          return (
            <div
              key={run.id}
              className={`flex items-center gap-1 rounded-md border px-2 py-1 ${
                active
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => switchInterview(run.id)}
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--text)] pr-1"
              >
                <UserRound className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>{run.label}</span>
                {hasOutput && (
                  <span className="text-[9px] uppercase tracking-wide text-emerald-600 font-bold">Done</span>
                )}
              </button>
              {runs.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Remove "${run.label}"?`)) deleteInterview(run.id);
                  }}
                  className="p-1 text-[var(--text-muted)] hover:text-red-600"
                  title="Remove interview"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
