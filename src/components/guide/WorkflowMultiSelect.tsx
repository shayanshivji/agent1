"use client";

import { Check } from "lucide-react";
import type { Workflow } from "@/types/guide";

interface WorkflowMultiSelectProps {
  workflows: Workflow[];
  selectedIds: string[];
  onToggle: (workflowId: string) => void;
}

export function WorkflowMultiSelect({ workflows, selectedIds, onToggle }: WorkflowMultiSelectProps) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-[var(--text-muted)]">
        Select one or more processes to scope in this engagement. The guide will cover all selected workflows.
      </p>
      <div className="border border-[var(--border)] rounded-lg divide-y divide-[var(--border)] bg-white overflow-hidden">
        {workflows.map((w) => {
          const selected = selectedIds.includes(w.id);
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onToggle(w.id)}
              className={`w-full text-left px-3 py-2.5 flex items-start gap-3 transition-colors ${
                selected ? "bg-[var(--accent)]/5" : "hover:bg-[var(--surface-muted)]"
              }`}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border-strong)] bg-white"
                }`}
                aria-hidden
              >
                {selected && <Check className="h-3 w-3" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-sm font-medium text-[var(--text)]">{w.name}</span>
                <span className="block text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                  {w.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {selectedIds.length > 0 && (
        <p className="text-[11px] text-[var(--accent)] font-medium">
          {selectedIds.length} workflow{selectedIds.length === 1 ? "" : "s"} selected
        </p>
      )}
    </div>
  );
}
