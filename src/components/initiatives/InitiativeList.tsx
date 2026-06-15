"use client";

import { useInitiativeStore } from "@/store/initiative-store";
import { filterInitiatives } from "@/lib/initiatives/logic";
import { InitiativeCard } from "@/components/initiatives/InitiativeCard";
import {
  downloadInventoryCsv,
  downloadInventoryJson,
  downloadInventoryMarkdown,
} from "@/lib/export/initiatives";
import { Download, FileJson, Table } from "lucide-react";

export function InitiativeList() {
  const { inventory, viewFilter } = useInitiativeStore();

  if (!inventory) {
    return (
      <div className="section-card p-12 text-center">
        <h2 className="text-lg font-semibold text-gradient mb-2">
          No initiatives yet
        </h2>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
          Configure workflow and input mode, then generate a process-driven
          initiative inventory mapped to pain points and process steps.
        </p>
      </div>
    );
  }

  const filtered = filterInitiatives(inventory.initiatives, viewFilter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">
            {inventory.workflowName}
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {filtered.length} initiatives · {viewFilter.replace(/_/g, " ")}
            {inventory.generationMode && ` · ${inventory.generationMode}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadInventoryMarkdown(inventory, viewFilter)}
            className="btn-secondary text-xs py-1.5"
          >
            <Download className="h-3 w-3" /> MD
          </button>
          <button
            type="button"
            onClick={() => downloadInventoryCsv(inventory, viewFilter)}
            className="btn-secondary text-xs py-1.5"
          >
            <Table className="h-3 w-3" /> CSV
          </button>
          <button
            type="button"
            onClick={() => downloadInventoryJson(inventory, viewFilter)}
            className="btn-primary text-xs py-1.5"
          >
            <FileJson className="h-3 w-3" /> JSON handoff
          </button>
        </div>
      </div>

      <div className="draft-banner rounded-lg px-4 py-3 text-sm mb-4">
        <strong>Human review required.</strong> Value sizing and prioritization
        assumptions must be validated before downstream agents (roadmap, future
        state).
      </div>

      <div className="space-y-3">
        {filtered.map((init) => (
          <InitiativeCard key={init.id} initiative={init} />
        ))}
      </div>
    </div>
  );
}
