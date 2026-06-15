import type {
  BenchmarkGap,
  EnablerCategory,
  EvidenceStrength,
  ExecutionComplexity,
  FindingType,
  Horizon,
  ImpactDirection,
  ImprovementInitiative,
  InitiativeLifecycle,
  LeverType,
  MaturityLevel,
  ValueType,
} from "@/types/initiative";

/** McKinsey diagnostic methodology — shared across agents, consumed by Agent 4 prompts. */
export const MCKINSEY_DIAGNOSTIC_LENSES = {
  valueAtStake: "Quantify what is realistically available (benchmark gap, sizing, triangulation)",
  operatingEffectiveness: "Explain why value leaks (process map, maturity, root causes, pain points)",
  synthesis: "Group findings into themes; separate value blockers from efficiency improvements",
  prioritization: "Near-term impact × timing dependency × execution complexity × capacity",
  timePhasing: "H1 quick wins → H2 scale → H3 structural/transform; tie to renewals and roadmaps",
} as const;

export const FINDING_TYPE_LABELS: Record<FindingType, string> = {
  value_blocker: "Value blocker",
  efficiency_improvement: "Efficiency improvement",
};

export const VALUE_TYPE_LABELS: Record<ValueType, string> = {
  run_rate_savings: "Run-rate savings",
  operational_value: "Operational value",
  growth_at_stake: "Growth at stake",
  risk_reduction: "Risk reduction",
};

export const MATURITY_LABELS: Record<MaturityLevel, string> = {
  reactive: "Reactive",
  inconsistent: "Inconsistent",
  institutionalized: "Institutionalized",
};

export const ENABLER_LABELS: Record<EnablerCategory, string> = {
  process: "Process",
  capability: "Capability / category mgmt",
  technology_data: "Technology & data",
  governance: "Org & governance",
  talent: "Talent & capability building",
  kpis_reporting: "KPIs & reporting",
};

export const EXECUTION_COMPLEXITY_LABELS: Record<ExecutionComplexity, string> = {
  low: "Low (weeks)",
  medium: "Medium (months)",
  high: "High (quarters+)",
};

export const BENCHMARK_GAP_LABELS: Record<BenchmarkGap, string> = {
  above_peer: "Above peer",
  at_peer: "At peer",
  below_peer: "Below peer (gap)",
  unknown: "Unknown / not benchmarked",
};

export const MCKINSEY_INITIATIVE_METHODOLOGY = `
MCKINSEY DIAGNOSTIC METHODOLOGY (apply rigorously):

TWO-LENS THINKING:
1) Value at stake — what impact is realistically capturable (savings, growth, operational value, risk)?
2) Operating effectiveness — why does value leak at specific process steps (root causes, maturity gaps)?

INITIATIVE RULES:
- Process-first: every initiative MUST tie to process step(s) AND pain point(s) — no orphan brainstorming
- Distinguish value_blocker (materially prevents value capture) vs efficiency_improvement (reduces friction)
- Classify value_type: run_rate_savings | operational_value | growth_at_stake | risk_reduction
- Map enabler_category: process | capability | technology_data | governance | talent | kpis_reporting
- Assess current_maturity → target_maturity on scale: reactive | inconsistent | institutionalized
- Use benchmark_gap when evidence supports peer comparison: above_peer | at_peer | below_peer | unknown
- execution_complexity: low (weeks) | medium (months) | high (quarters+)
- timing_dependency: note renewals, RFPs, hiring cycles, or seasonal constraints when relevant
- sequencing_rationale: why this horizon and order (near-term impact, dependencies, capacity)
- Flag lifecycle: new | partially_existing | in_flight when evidence suggests ongoing work
- Flag duplicates/overlaps; avoid double-counting similar levers on same pain point
- evidence_strength must reflect source quality (interview > document > benchmark > inference)

PRIORITIZATION (McKinsey synthesis):
- Prioritize value blockers with high near-term impact and clear evidence
- Deprioritize noise: low-impact efficiency tweaks unless they unblock a value blocker
- Weight: impact direction × evidence × actionability − execution complexity penalty

HORIZON PHASING:
- H1 (0–6 mo): quick wins, in-flight acceleration, immediate renewals/negotiations
- H2 (6–18 mo): scale enablers, standardization, capability build
- H3 (18+ mo): structural transform, operating model, institutionalized ways of working

JARGON TO USE IN DESCRIPTIONS (when accurate):
value at stake, fact base, addressable scope, root cause, triangulation, run-rate vs in-year,
current vs target state, best-in-class, peer benchmark, value blocker, enabler, maturity gap.
`.trim();

const VALID = {
  findingType: ["value_blocker", "efficiency_improvement"] as FindingType[],
  valueType: ["run_rate_savings", "operational_value", "growth_at_stake", "risk_reduction"] as ValueType[],
  maturity: ["reactive", "inconsistent", "institutionalized"] as MaturityLevel[],
  enabler: ["process", "capability", "technology_data", "governance", "talent", "kpis_reporting"] as EnablerCategory[],
  complexity: ["low", "medium", "high"] as ExecutionComplexity[],
  benchmark: ["above_peer", "at_peer", "below_peer", "unknown"] as BenchmarkGap[],
};

function pick<T extends string>(raw: unknown, valid: readonly T[], fallback: T): T {
  return valid.includes(raw as T) ? (raw as T) : fallback;
}

export function leverToEnabler(lever: LeverType): EnablerCategory {
  const map: Record<LeverType, EnablerCategory> = {
    process_fix: "process",
    ai_automation: "technology_data",
    tech_data: "technology_data",
    policy_governance: "governance",
    org_design: "talent",
  };
  return map[lever];
}

export function inferFindingType(
  severity: "high" | "medium" | "low" | undefined,
  horizon: Horizon,
): FindingType {
  if (severity === "high" || horizon === "H1") return "value_blocker";
  return "efficiency_improvement";
}

export function inferValueType(lever: LeverType, findingType: FindingType): ValueType {
  if (lever === "ai_automation" || lever === "process_fix") {
    return findingType === "value_blocker" ? "operational_value" : "operational_value";
  }
  if (lever === "policy_governance") return "risk_reduction";
  if (lever === "org_design") return "operational_value";
  return findingType === "value_blocker" ? "run_rate_savings" : "operational_value";
}

export function inferExecutionComplexity(horizon: Horizon): ExecutionComplexity {
  if (horizon === "H1") return "low";
  if (horizon === "H2") return "medium";
  return "high";
}

export function inferMaturity(horizon: Horizon): { current: MaturityLevel; target: MaturityLevel } {
  if (horizon === "H1") {
    return { current: "reactive", target: "inconsistent" };
  }
  if (horizon === "H2") {
    return { current: "inconsistent", target: "institutionalized" };
  }
  return { current: "inconsistent", target: "institutionalized" };
}

export function computeMcKinseyPriorityScore(input: {
  impactDirection: ImpactDirection;
  evidenceStrength: EvidenceStrength;
  findingType: FindingType;
  executionComplexity: ExecutionComplexity;
  lifecycle: InitiativeLifecycle;
  isDuplicate: boolean;
  horizon: Horizon;
}): number {
  const impact = { high: 32, medium: 22, low: 12 }[input.impactDirection];
  const evidence = { high: 28, medium: 18, low: 8 }[input.evidenceStrength];
  const findingBonus = input.findingType === "value_blocker" ? 12 : 4;
  const complexityPenalty = { low: 0, medium: 4, high: 10 }[input.executionComplexity];
  const lifecycleBonus =
    input.lifecycle === "in_flight" ? 6 : input.lifecycle === "partially_existing" ? 3 : 0;
  const horizonBonus = input.horizon === "H1" ? 5 : 0;
  const duplicatePenalty = input.isDuplicate ? 25 : 0;

  return Math.max(
    0,
    Math.min(
      100,
      impact + evidence + findingBonus + lifecycleBonus + horizonBonus - complexityPenalty - duplicatePenalty,
    ),
  );
}

export function ensureInitiativeFields(init: ImprovementInitiative): ImprovementInitiative {
  if (init.findingType && init.valueType) return init;
  const mckinsey = normalizeInitiativeFields(
    init as unknown as Record<string, unknown>,
    init.order,
    init.impactDirection === "high" ? "high" : "medium",
  );
  return { ...init, ...mckinsey };
}

export function normalizeInitiativeFields(
  item: Record<string, unknown>,
  index: number,
  painSeverity?: "high" | "medium" | "low",
): Pick<
  ImprovementInitiative,
  | "findingType"
  | "valueType"
  | "enablerCategory"
  | "currentMaturity"
  | "targetMaturity"
  | "benchmarkGap"
  | "executionComplexity"
  | "timingDependency"
  | "sequencingRationale"
  | "rootCauseTheme"
  | "priorityScore"
> {
  const lever = (item.leverType as LeverType) ?? "process_fix";
  const horizon = pick(item.horizon, ["H1", "H2", "H3"] as const, "H2");
  const findingType = pick(
    item.findingType,
    VALID.findingType,
    inferFindingType(painSeverity, horizon),
  );
  const executionComplexity = pick(
    item.executionComplexity,
    VALID.complexity,
    inferExecutionComplexity(horizon),
  );
  const maturity = inferMaturity(horizon);

  const impactDirection = pick(item.impactDirection, ["high", "medium", "low"] as const, "medium");
  const evidenceStrength = pick(item.evidenceStrength, ["high", "medium", "low"] as const, "medium");
  const lifecycle = pick(
    item.lifecycle,
    ["new", "partially_existing", "in_flight"] as const,
    "new",
  );
  const isDuplicate = Boolean(item.isDuplicate);

  const priorityScore =
    Number(item.priorityScore) ||
    computeMcKinseyPriorityScore({
      impactDirection,
      evidenceStrength,
      findingType,
      executionComplexity,
      lifecycle,
      isDuplicate,
      horizon,
    });

  return {
    findingType,
    valueType: pick(item.valueType, VALID.valueType, inferValueType(lever, findingType)),
    enablerCategory: pick(item.enablerCategory, VALID.enabler, leverToEnabler(lever)),
    currentMaturity: pick(item.currentMaturity, VALID.maturity, maturity.current),
    targetMaturity: pick(item.targetMaturity, VALID.maturity, maturity.target),
    benchmarkGap: pick(item.benchmarkGap, VALID.benchmark, "unknown"),
    executionComplexity,
    timingDependency: item.timingDependency ? String(item.timingDependency) : undefined,
    sequencingRationale: item.sequencingRationale
      ? String(item.sequencingRationale)
      : `Phased as ${horizon} based on impact, dependencies, and execution complexity.`,
    rootCauseTheme: item.rootCauseTheme ? String(item.rootCauseTheme) : undefined,
    priorityScore: Math.round(priorityScore),
  };
}
