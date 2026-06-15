"use client";

import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FileUp, Loader2, X } from "lucide-react";
import { useInitiativeStore } from "@/store/initiative-store";
import { filterInitiatives } from "@/lib/initiatives/logic";
import { extractTextFromFile } from "@/lib/ingest/extract-text";
import { HORIZON_LABELS, LEVER_LABELS } from "@/types/initiative";

const TABS = [
  { id: "pain" as const, label: "Pain points" },
  { id: "process" as const, label: "Process map" },
  { id: "mapping" as const, label: "Mapping" },
  { id: "horizon" as const, label: "Horizon" },
  { id: "sources" as const, label: "Sources" },
];

export function InitiativeSidePanel() {
  const {
    sidePanel,
    setSidePanel,
    painPoints,
    processSteps,
    inventory,
    sources,
    viewFilter,
    addSource,
    removeSource,
  } = useInitiativeStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const text = await extractTextFromFile(file);
        addSource({
          id: uuidv4(),
          name: file.name,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          extractedText: text,
          charCount: text.length,
        });
      } catch {
        /* skip */
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const filtered = inventory
    ? filterInitiatives(inventory.initiatives, viewFilter)
    : [];

  const byHorizon = { H1: 0, H2: 0, H3: 0 };
  filtered.forEach((i) => {
    byHorizon[i.horizon]++;
  });

  return (
    <div className="section-card overflow-hidden">
      <div className="flex overflow-x-auto border-b border-[var(--border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSidePanel(t.id)}
            className={`shrink-0 px-3 py-2 text-xs font-medium transition-colors ${
              sidePanel === t.id
                ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 max-h-[520px] overflow-y-auto text-sm">
        {sidePanel === "pain" && (
          <div className="space-y-3">
            {!painPoints.length && !inventory?.painPoints.length && (
              <p className="text-xs text-[var(--text-muted)] italic">
                Pain points appear after generation or from pipeline input.
              </p>
            )}
            {(inventory?.painPoints ?? painPoints).map((pp) => (
              <div
                key={pp.id}
                className="border border-[var(--border)] rounded-lg p-3 bg-[rgba(6,8,15,0.5)]"
              >
                <p className="font-medium text-[var(--text)]">{pp.title}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{pp.description}</p>
                <p className="text-[10px] text-[var(--accent)] mt-1">
                  {pp.severity ?? "—"} · steps: {pp.processStepIds.join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}

        {sidePanel === "process" && (
          <div className="space-y-3">
            {(inventory?.processSteps ?? processSteps).map((step) => (
              <div
                key={step.id}
                className="border border-[var(--border)] rounded-lg p-3 bg-[rgba(6,8,15,0.5)]"
              >
                <p className="font-medium text-[var(--text)]">{step.name}</p>
                {step.description && (
                  <p className="text-xs text-[var(--text-muted)] mt-1">{step.description}</p>
                )}
                {step.systems && (
                  <p className="text-[10px] text-[var(--accent)] mt-1">
                    {step.systems.join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {sidePanel === "mapping" && (
          <div className="space-y-2">
            {!inventory && (
              <p className="text-xs text-[var(--text-muted)] italic">
                Generate initiatives to see pain point mappings.
              </p>
            )}
            {inventory?.mappings.map((m) => {
              const init = inventory.initiatives.find((i) => i.id === m.initiativeId);
              const pp = inventory.painPoints.find((p) => p.id === m.painPointId);
              return (
                <div
                  key={`${m.initiativeId}-${m.painPointId}`}
                  className="text-xs border-l-2 border-[var(--accent)] pl-3 py-1"
                >
                  <span className="text-[var(--accent)]">{init?.title}</span>
                  <span className="text-[var(--text-muted)]"> → </span>
                  <span>{pp?.title}</span>
                </div>
              );
            })}
          </div>
        )}

        {sidePanel === "horizon" && (
          <div className="space-y-3">
            {(["H1", "H2", "H3"] as const).map((h) => (
              <div
                key={h}
                className="flex justify-between items-center border border-[var(--border)] rounded-lg px-3 py-2"
              >
                <span className="text-xs text-[var(--text-muted)]">
                  {HORIZON_LABELS[h]}
                </span>
                <span className="font-mono text-[var(--accent)]">{byHorizon[h]}</span>
              </div>
            ))}
            {filtered.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase">
                  By lever
                </p>
                {Object.entries(
                  filtered.reduce<Record<string, number>>((acc, i) => {
                    acc[i.leverType] = (acc[i.leverType] ?? 0) + 1;
                    return acc;
                  }, {}),
                ).map(([lever, count]) => (
                  <div key={lever} className="flex justify-between text-xs">
                    <span>{LEVER_LABELS[lever as keyof typeof LEVER_LABELS]}</span>
                    <span className="text-[var(--accent)]">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {sidePanel === "sources" && (
          <div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-[var(--border-strong)] rounded-md py-3 text-xs text-[var(--text-muted)] hover:border-[var(--accent)]"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
              Upload sources
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".txt,.md,.csv,.json"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="mt-3 space-y-2">
              {sources.map((s) => (
                <div
                  key={s.id}
                  className="flex justify-between items-start border border-[var(--border)] rounded p-2"
                >
                  <div>
                    <span className="source-chip">{s.name}</span>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      {s.charCount} chars
                    </p>
                  </div>
                  <button type="button" onClick={() => removeSource(s.id)}>
                    <X className="h-4 w-4 text-[var(--text-muted)]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
