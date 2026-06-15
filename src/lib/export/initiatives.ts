import type { InitiativeInventory, InitiativeViewFilter } from "@/types/initiative";
import { LEVER_LABELS, HORIZON_LABELS } from "@/types/initiative";
import {
  BENCHMARK_GAP_LABELS,
  ENABLER_LABELS,
  EXECUTION_COMPLEXITY_LABELS,
  FINDING_TYPE_LABELS,
  VALUE_TYPE_LABELS,
} from "@/lib/diagnostics/mckinsey-framework";
import { ensureInitiativeFields } from "@/lib/diagnostics/mckinsey-framework";
import { filterInitiatives } from "@/lib/initiatives/logic";

export function inventoryToMarkdown(
  inv: InitiativeInventory,
  viewFilter?: InitiativeViewFilter,
): string {
  const filter = viewFilter ?? inv.viewFilter;
  const filtered = filterInitiatives(inv.initiatives, filter).map(ensureInitiativeFields);
  const lines: string[] = [
    `# Improvement Initiatives: ${inv.workflowName}`,
    "",
    `**Company:** ${inv.companyName ?? "N/A"}  `,
    `**Mode:** ${inv.inputMode} · **Filter:** ${filter}  `,
    `**Generated:** ${new Date(inv.updatedAt).toLocaleString()}`,
    "",
    "---",
    "",
    "## Initiative inventory",
    "",
  ];

  for (const init of filtered) {
    lines.push(
      `### ${init.title}`,
      "",
      init.description,
      "",
      `- **Horizon:** ${HORIZON_LABELS[init.horizon]}`,
      `- **Lever:** ${LEVER_LABELS[init.leverType]}`,
      `- **Finding:** ${FINDING_TYPE_LABELS[init.findingType]} · **Value type:** ${VALUE_TYPE_LABELS[init.valueType]}`,
      `- **Enabler:** ${ENABLER_LABELS[init.enablerCategory]} · **Complexity:** ${EXECUTION_COMPLEXITY_LABELS[init.executionComplexity]}`,
      `- **Maturity:** ${init.currentMaturity} → ${init.targetMaturity} · **Benchmark:** ${BENCHMARK_GAP_LABELS[init.benchmarkGap]}`,
      `- **Lifecycle:** ${init.lifecycle}`,
      `- **Impact:** ${init.impactDirection} · **Evidence:** ${init.evidenceStrength}`,
      `- **Priority score:** ${init.priorityScore}`,
      init.rootCauseTheme ? `- **Root cause theme:** ${init.rootCauseTheme}` : "",
      init.timingDependency ? `- **Timing dependency:** ${init.timingDependency}` : "",
      init.sequencingRationale ? `- **Sequencing:** ${init.sequencingRationale}` : "",
      `- **Process steps:** ${init.processStepIds.join(", ")}`,
      `- **Pain points:** ${init.painPointIds.join(", ")}`,
      init.isDuplicate ? `- **⚠ Duplicate/overlap:** ${init.duplicateNote ?? "yes"}` : "",
      init.dependencies.length ? `- **Dependencies:** ${init.dependencies.join("; ")}` : "",
      init.risks.length ? `- **Risks:** ${init.risks.join("; ")}` : "",
      "",
    );
  }

  lines.push("## Pain point → initiative mapping", "");
  for (const m of inv.mappings) {
    const pp = inv.painPoints.find((p) => p.id === m.painPointId);
    const init = inv.initiatives.find((i) => i.id === m.initiativeId);
    lines.push(
      `- **${init?.title ?? m.initiativeId}** → ${pp?.title ?? m.painPointId} (${m.rationale})`,
    );
  }

  return lines.filter(Boolean).join("\n");
}

export function inventoryToCsv(
  inv: InitiativeInventory,
  viewFilter?: InitiativeViewFilter,
): string {
  const filtered = filterInitiatives(inv.initiatives, viewFilter ?? inv.viewFilter).map(
    ensureInitiativeFields,
  );
  const headers = [
    "title",
    "description",
    "horizon",
    "lever_type",
    "finding_type",
    "value_type",
    "enabler_category",
    "execution_complexity",
    "current_maturity",
    "target_maturity",
    "benchmark_gap",
    "lifecycle",
    "impact_direction",
    "evidence_strength",
    "priority_score",
    "root_cause_theme",
    "timing_dependency",
    "process_steps",
    "pain_points",
    "dependencies",
    "risks",
    "is_duplicate",
    "quick_win_type",
  ];
  const rows = filtered.map((i) =>
    [
      csvCell(i.title),
      csvCell(i.description),
      i.horizon,
      i.leverType,
      i.findingType,
      i.valueType,
      i.enablerCategory,
      i.executionComplexity,
      i.currentMaturity,
      i.targetMaturity,
      i.benchmarkGap,
      i.lifecycle,
      i.impactDirection,
      i.evidenceStrength,
      String(i.priorityScore),
      csvCell(i.rootCauseTheme ?? ""),
      csvCell(i.timingDependency ?? ""),
      csvCell(i.processStepIds.join("|")),
      csvCell(i.painPointIds.join("|")),
      csvCell(i.dependencies.join("|")),
      csvCell(i.risks.join("|")),
      String(i.isDuplicate),
      i.quickWinType,
    ].join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

function csvCell(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function inventoryToPipelineJson(
  inv: InitiativeInventory,
  viewFilter?: InitiativeViewFilter,
): string {
  return JSON.stringify(
    {
      sourceAgent: "improvement-initiatives" as const,
      diagnosticFramework: "mckinsey-two-lens" as const,
      workflowId: inv.workflowId,
      workflowName: inv.workflowName,
      companyName: inv.companyName,
      processSteps: inv.processSteps,
      painPoints: inv.painPoints,
      initiatives: filterInitiatives(inv.initiatives, viewFilter ?? inv.viewFilter).map(
        ensureInitiativeFields,
      ),
      mappings: inv.mappings,
      generatedAt: inv.updatedAt,
    },
    null,
    2,
  );
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadInventoryMarkdown(
  inv: InitiativeInventory,
  viewFilter?: InitiativeViewFilter,
) {
  downloadFile(
    inventoryToMarkdown(inv, viewFilter),
    `initiatives-${inv.workflowId}.md`,
    "text/markdown",
  );
}

export function downloadInventoryCsv(
  inv: InitiativeInventory,
  viewFilter?: InitiativeViewFilter,
) {
  downloadFile(
    inventoryToCsv(inv, viewFilter),
    `initiatives-${inv.workflowId}.csv`,
    "text/csv",
  );
}

export function downloadInventoryJson(
  inv: InitiativeInventory,
  viewFilter?: InitiativeViewFilter,
) {
  downloadFile(
    inventoryToPipelineJson(inv, viewFilter),
    `initiatives-${inv.workflowId}.json`,
    "application/json",
  );
}
