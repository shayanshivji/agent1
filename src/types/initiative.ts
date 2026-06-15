import type { PainPoint, ProcessStep } from "@/types/pipeline";

export type InputMode = "standalone" | "pipeline";

export type InitiativeViewFilter =
  | "comprehensive"
  | "top_priorities"
  | "value_blockers"
  | "ai_automation"
  | "process_redesign"
  | "horizon_h1"
  | "horizon_h2"
  | "horizon_h3";

export type FindingType = "value_blocker" | "efficiency_improvement";

export type ValueType =
  | "run_rate_savings"
  | "operational_value"
  | "growth_at_stake"
  | "risk_reduction";

export type MaturityLevel = "reactive" | "inconsistent" | "institutionalized";

export type EnablerCategory =
  | "process"
  | "capability"
  | "technology_data"
  | "governance"
  | "talent"
  | "kpis_reporting";

export type ExecutionComplexity = "low" | "medium" | "high";

export type BenchmarkGap = "above_peer" | "at_peer" | "below_peer" | "unknown";

export type LeverType =
  | "process_fix"
  | "ai_automation"
  | "tech_data"
  | "policy_governance"
  | "org_design";

export type Horizon = "H1" | "H2" | "H3";

export type InitiativeLifecycle = "new" | "partially_existing" | "in_flight";

export type QuickWinType = "quick_win" | "deeper_redesign";

export type EvidenceStrength = "high" | "medium" | "low";

export type ImpactDirection = "high" | "medium" | "low";

export interface ImprovementInitiative {
  id: string;
  title: string;
  description: string;
  processStepIds: string[];
  painPointIds: string[];
  leverType: LeverType;
  horizon: Horizon;
  lifecycle: InitiativeLifecycle;
  dependencies: string[];
  risks: string[];
  impactDirection: ImpactDirection;
  evidenceStrength: EvidenceStrength;
  quickWinType: QuickWinType;
  sourceReferences: string[];
  priorityScore: number;
  isDuplicate: boolean;
  duplicateNote?: string;
  order: number;
  /** McKinsey diagnostic framing */
  findingType: FindingType;
  valueType: ValueType;
  enablerCategory: EnablerCategory;
  currentMaturity: MaturityLevel;
  targetMaturity: MaturityLevel;
  benchmarkGap: BenchmarkGap;
  executionComplexity: ExecutionComplexity;
  timingDependency?: string;
  sequencingRationale?: string;
  rootCauseTheme?: string;
}

export interface InitiativeMapping {
  initiativeId: string;
  painPointId: string;
  processStepId: string;
  rationale: string;
}

export interface InitiativeInventory {
  id: string;
  workflowId: string;
  workflowName: string;
  companyName?: string;
  inputMode: InputMode;
  processSteps: ProcessStep[];
  painPoints: PainPoint[];
  initiatives: ImprovementInitiative[];
  mappings: InitiativeMapping[];
  viewFilter: InitiativeViewFilter;
  createdAt: string;
  updatedAt: string;
  customNotes?: string;
  generationMode?: "llm" | "template";
}

export interface InitiativeGenerationRequest {
  workflowId: string;
  workflowName: string;
  companyName?: string;
  industryId?: string;
  functionId?: string;
  inputMode: InputMode;
  viewFilter: InitiativeViewFilter;
  customNotes?: string;
  sources: { name: string; extractedText: string }[];
  pipelinePayload?: string;
  processSteps?: ProcessStep[];
  painPoints?: PainPoint[];
}

export const LEVER_LABELS: Record<LeverType, string> = {
  process_fix: "Process fix",
  ai_automation: "AI / automation",
  tech_data: "Tech / data foundation",
  policy_governance: "Policy / governance",
  org_design: "Org design",
};

export const HORIZON_LABELS: Record<Horizon, string> = {
  H1: "H1 — Quick wins (0–6 mo)",
  H2: "H2 — Scale (6–18 mo)",
  H3: "H3 — Transform (18+ mo)",
};
