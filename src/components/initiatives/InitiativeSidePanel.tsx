"use client";

import { filterInitiatives } from "@/lib/initiatives/logic";
import { ensureInitiativeFields } from "@/lib/diagnostics/mckinsey-framework";
import { FINDING_TYPE_LABELS } from "@/lib/diagnostics/mckinsey-framework";
import { useInitiativeStore } from "@/store/initiative-store";
import { HORIZON_LABELS, LEVER_LABELS } from "@/types/initiative";

const TABS = [
  { id: "pain" as const, label: "Pain points" },
  { id: "process" as const, label: "Process map" },
  { id: "mapping" as const, label: "Mapping" },
  { id: "horizon" as const, label: "Horizon" },
];

export function InitiativeSidePanel() {
  const {
    sidePanel,
    setSidePanel,
    painPoints,
    processSteps,
    inventory,
    viewFilter,
  } = useInitiativeStore();

  const filtered = inventory
    ? filterInitiatives(inventory.initiatives, viewFilter).map(ensureInitiativeFields)
    : [];

  const byHorizon = { H1: 0, H2: 0, H3: 0 };
  let valueBlockers = 0;
  filtered.forEach((i) => {
    byHorizon[i.horizon]++;
    if (i.findingType === "value_blocker") valueBlockers++;
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
                  {pp.severity ?? "n/a"} · steps: {pp.processStepIds.join(", ")}
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
              <div className="flex justify-between items-center border border-rose-500/30 rounded-lg px-3 py-2 bg-rose-500/5">
                <span className="text-xs text-rose-200">
                  {FINDING_TYPE_LABELS.value_blocker}
                </span>
                <span className="font-mono text-rose-300">{valueBlockers}</span>
              </div>
            )}
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

      </div>
    </div>
  );
}
