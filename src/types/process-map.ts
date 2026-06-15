import type { InputMode } from "@/types/initiative";

export type StepConfidence = "confirmed" | "inferred" | "uncertain";

export type MapSeverity = "critical" | "high" | "medium" | "low";

export type ImprovementBucket = "simplify" | "automate" | "digitize" | "consolidate";

export type ProcessMapTab = "summary" | "process" | "pain" | "improvements";

export type RefineTarget =
  | "full_map"
  | "process_steps"
  | "pain_points"
  | "improvements"
  | "narrative";

export interface MapActor {
  id: string;
  name: string;
  shortLabel?: string;
  color: string;
}

export interface MapPhase {
  id: string;
  name: string;
  order: number;
}

export interface MapProcessStep {
  id: string;
  phaseId: string;
  name: string;
  description: string;
  actorId: string;
  systems: string[];
  input?: string;
  output?: string;
  nextStepId?: string;
  handoffTo?: string;
  frequency?: string;
  painPointIds: string[];
  evidenceRefs: string[];
  confidence: StepConfidence;
  worksWell?: string;
  order: number;
}

export interface MapPainPoint {
  id: string;
  phaseId: string;
  processStepIds: string[];
  title: string;
  description: string;
  severity: MapSeverity;
  evidenceSnippet: string;
  sourceDocument?: string;
}

export interface MapImprovement {
  id: string;
  processStepIds: string[];
  painPointIds: string[];
  title: string;
  description: string;
  bucket: ImprovementBucket;
  impactRange?: string;
  priority: "high" | "medium" | "low";
}

export interface AlternateFlow {
  id: string;
  name: string;
  description: string;
  stepIds: string[];
}

export interface InitiativeReference {
  id: string;
  title: string;
  status: "in_flight" | "partial" | "planned";
  processStepIds: string[];
  note?: string;
}

export interface RefinementRecord {
  id: string;
  target: RefineTarget;
  feedback: string;
  createdAt: string;
}

export interface ProcessMapDocument {
  id: string;
  workflowId: string;
  workflowName: string;
  companyName?: string;
  purpose: string;
  narrativeSummary: string;
  phases: MapPhase[];
  actors: MapActor[];
  steps: MapProcessStep[];
  painPoints: MapPainPoint[];
  improvements: MapImprovement[];
  alternateFlows: AlternateFlow[];
  inFlightInitiatives: InitiativeReference[];
  openQuestions: string[];
  inputMode: InputMode;
  createdAt: string;
  updatedAt: string;
  generationMode?: "llm" | "template";
  refinements: RefinementRecord[];
}

export const IMPROVEMENT_BUCKET_LABELS: Record<ImprovementBucket, string> = {
  simplify: "Simplify",
  automate: "Automate",
  digitize: "Digitize",
  consolidate: "Consolidate",
};

export const CONFIDENCE_LABELS: Record<StepConfidence, string> = {
  confirmed: "Confirmed",
  inferred: "Inferred",
  uncertain: "Uncertain",
};

export const ACTOR_COLORS = [
  "#2563eb",
  "#0d9488",
  "#ea580c",
  "#16a34a",
  "#7c3aed",
  "#db2777",
];
