/** Shared cross-agent vocabulary for the diagnostic pipeline. */

export type AgentId =
  | "scoping"
  | "live-interview"
  | "process-mapping"
  | "improvement-initiatives"
  | "future-state"
  | "roadmapping"
  | "brd-drafting";

export interface PipelineDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  extractedText: string;
  charCount: number;
}

export interface ProcessStep {
  id: string;
  name: string;
  description?: string;
  systems?: string[];
  ownerRole?: string;
}

export interface PainPoint {
  id: string;
  workflowId: string;
  processStepIds: string[];
  title: string;
  description: string;
  severity?: "high" | "medium" | "low";
  evidenceSnippet?: string;
  sourceDocument?: string;
}

/** Structured handoff from Agents 1–3 (pipeline mode). */
export interface UpstreamPipelinePayload {
  sourceAgent?: AgentId;
  workflowId?: string;
  workflowName?: string;
  companyName?: string;
  processSteps?: ProcessStep[];
  painPoints?: PainPoint[];
  interviewNotes?: string;
  factBaseRequirements?: string[];
  processMapText?: string;
  generatedAt?: string;
}
