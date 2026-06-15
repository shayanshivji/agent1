"use client";

import type { ImprovementInitiative } from "@/types/initiative";
import { HORIZON_LABELS, LEVER_LABELS } from "@/types/initiative";
import { useInitiativeStore } from "@/store/initiative-store";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface InitiativeCardProps {
  initiative: ImprovementInitiative;
}

export function InitiativeCard({ initiative }: InitiativeCardProps) {
  const { updateInitiative, reorderInitiative } = useInitiativeStore();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`section-card overflow-hidden ${
        initiative.isDuplicate ? "border-amber-500/40" : ""
      }`}
    >
      <div className="flex items-start gap-2 p-4">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex-1 text-left min-w-0"
        >
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-[var(--accent)]">
              {initiative.horizon}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)]">
              {LEVER_LABELS[initiative.leverType]}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              score {initiative.priorityScore}
            </span>
            {initiative.isDuplicate && (
              <span className="text-[10px] text-amber-400">overlap</span>
            )}
          </div>
          <h3 className="font-semibold text-[var(--text)]">{initiative.title}</h3>
          {!open && (
            <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
              {initiative.description}
            </p>
          )}
        </button>
        <div className="flex flex-col gap-1 shrink-0">
          <button
            type="button"
            onClick={() => reorderInitiative(initiative.id, "up")}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)]"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => reorderInitiative(initiative.id, "down")}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)]"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-[var(--border)] pt-3 space-y-3">
          <textarea
            value={initiative.description}
            onChange={(e) =>
              updateInitiative(initiative.id, { description: e.target.value })
            }
            rows={3}
            className="field-input text-sm resize-y"
          />
          <input
            value={initiative.title}
            onChange={(e) => updateInitiative(initiative.id, { title: e.target.value })}
            className="field-input text-sm font-medium"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="field-label">Horizon</label>
              <select
                value={initiative.horizon}
                onChange={(e) =>
                  updateInitiative(initiative.id, {
                    horizon: e.target.value as ImprovementInitiative["horizon"],
                  })
                }
                className="field-input text-xs"
              >
                {(["H1", "H2", "H3"] as const).map((h) => (
                  <option key={h} value={h}>
                    {HORIZON_LABELS[h]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Lifecycle</label>
              <select
                value={initiative.lifecycle}
                onChange={(e) =>
                  updateInitiative(initiative.id, {
                    lifecycle: e.target.value as ImprovementInitiative["lifecycle"],
                  })
                }
                className="field-input text-xs"
              >
                <option value="new">New</option>
                <option value="partially_existing">Partially existing</option>
                <option value="in_flight">In-flight</option>
              </select>
            </div>
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">
            Steps: {initiative.processStepIds.join(", ")} · Pains:{" "}
            {initiative.painPointIds.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
