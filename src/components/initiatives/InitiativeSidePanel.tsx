"use client";

import { filterInitiatives } from "@/lib/initiatives/logic";
import { ensureInitiativeFields } from "@/lib/diagnostics/mckinsey-framework";
import { FINDING_TYPE_LABELS } from "@/lib/diagnostics/mckinsey-framework";
import { useInitiativeStore } from "@/store/initiative-store";
import { HORIZON_LABELS, LEVER_LABELS } from "@/types/initiative";
import { SeverityBadge } from "@/components/process-map/SeverityBadge";

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

  const pains = inventory?.painPoints ?? painPoints;
  const steps = inventory?.processSteps ?? processSteps;

  return (
    <div className="section-card overflow-hidden">
      <div className="flex gap-1 p-2 border-b border-[var(--border)] bg-[var(--surface-muted)] overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSidePanel(t.id)}
            className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              sidePanel === t.id
                ? "bg-white text-[var(--accent)] shadow-sm font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 max-h-[520px] overflow-y-auto text-sm bg-[var(--surface-muted)]/30">
        {sidePanel === "pain" && (
          <div className="space-y-3">
            {!pains.length && (
              <p className="text-xs text-[var(--text-muted)] italic">
                Pain points appear after generation or from pipeline input.
              </p>
            )}
            {pains.map((pp) => (
              <div
                key={pp.id}
                className="border border-[var(--border)] rounded-lg p-3 bg-white shadow-sm"
              >
                <p className="font-semibold text-sm text-[var(--text)] leading-snug">{pp.title}</p>
                {pp.description && (
                  <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                    {pp.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  {pp.severity && <SeverityBadge severity={pp.severity} />}
                  {pp.processStepIds.length > 0 && (
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Steps: {pp.processStepIds.join(", ")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {sidePanel === "process" && (
          <div className="space-y-3">
            {!steps.length && (
              <p className="text-xs text-[var(--text-muted)] italic">No process steps loaded yet.</p>
            )}
            {steps.map((step) => (
              <div
                key={step.id}
                className="border border-[var(--border)] rounded-lg p-3 bg-white shadow-sm"
              >
                <p className="font-semibold text-sm text-[var(--text)]">{step.name}</p>
                {step.description && (
                  <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                    {step.description}
                  </p>
                )}
                {step.systems && step.systems.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {step.systems.map((sys) => (
                      <span
                        key={sys}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)]"
                      >
                        {sys}
                      </span>
                    ))}
                  </div>
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
                  className="text-xs border border-[var(--border)] rounded-lg bg-white px-3 py-2 shadow-sm"
                >
                  <span className="font-medium text-[var(--accent)]">{init?.title}</span>
                  <span className="text-[var(--text-muted)]"> → </span>
                  <span className="text-[var(--text)]">{pp?.title}</span>
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
                className="flex justify-between items-center border border-[var(--border)] rounded-lg px-3 py-2.5 bg-white shadow-sm"
              >
                <span className="text-xs font-medium text-[var(--text)]">{HORIZON_LABELS[h]}</span>
                <span className="text-sm font-semibold text-[var(--accent)] tabular-nums">
                  {byHorizon[h]}
                </span>
              </div>
            ))}
            {filtered.length > 0 && (
              <div className="flex justify-between items-center border border-rose-200 rounded-lg px-3 py-2.5 bg-rose-50">
                <span className="text-xs font-medium text-rose-800">
                  {FINDING_TYPE_LABELS.value_blocker}
                </span>
                <span className="text-sm font-semibold text-rose-700 tabular-nums">{valueBlockers}</span>
              </div>
            )}
            {filtered.length > 0 && (
              <div className="mt-4 space-y-2 border border-[var(--border)] rounded-lg p-3 bg-white">
                <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  By lever
                </p>
                {Object.entries(
                  filtered.reduce<Record<string, number>>((acc, i) => {
                    acc[i.leverType] = (acc[i.leverType] ?? 0) + 1;
                    return acc;
                  }, {}),
                ).map(([lever, count]) => (
                  <div key={lever} className="flex justify-between text-xs">
                    <span className="text-[var(--text)]">
                      {LEVER_LABELS[lever as keyof typeof LEVER_LABELS]}
                    </span>
                    <span className="font-medium text-[var(--accent)] tabular-nums">{count}</span>
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
