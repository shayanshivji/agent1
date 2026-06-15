"use client";

import { useProcessMapStore } from "@/store/process-map-store";
import type { ProcessMapTab } from "@/types/process-map";

interface Props {
  onRefine?: () => void;
}

export function ProcessMapTabs({ onRefine }: Props) {
  const { document, activeTab, setActiveTab } = useProcessMapStore();
  if (!document) return null;

  const tabs: { id: ProcessMapTab; label: string; count?: number }[] = [
    { id: "summary", label: "Summary" },
    { id: "process", label: "Process map" },
    { id: "pain", label: "Pain points", count: document.painPoints.length },
    { id: "improvements", label: "Improvements", count: document.improvements.length },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div className="flex overflow-x-auto border-b border-[var(--border)] flex-1 min-w-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === t.id
                ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="ml-1.5 text-xs opacity-70">({t.count})</span>
            )}
          </button>
        ))}
      </div>
      {onRefine && (
        <button type="button" onClick={onRefine} className="btn-secondary text-xs shrink-0">
          Refine with feedback
        </button>
      )}
    </div>
  );
}
