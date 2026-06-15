import type { InterviewGuide } from "@/types/guide";
import type { InterviewExecutionDocument, LiveTurn } from "@/types/interview-execution";
import type { ProcessMapDocument } from "@/types/process-map";
import type { InitiativeInventory } from "@/types/initiative";

export type PlatformAgentSlug =
  | "scoping"
  | "live-interview"
  | "process-mapping"
  | "improvement-initiatives";

export interface ScopingSessionOutput {
  savedAt: string;
  companyName: string;
  industryId: string;
  functionId: string;
  workflowId: string;
  roleId: string;
  level: string;
  customNotes: string;
  guide: InterviewGuide | null;
}

export interface InterviewSessionOutput {
  savedAt: string;
  mode: string;
  workflowId: string;
  roleId: string;
  stakeholderName: string;
  guidePayload: string;
  transcriptText: string;
  liveTurns: LiveTurn[];
  document: InterviewExecutionDocument | null;
}

export interface ProcessMapSessionOutput {
  savedAt: string;
  workflowId: string;
  guidePayload: string;
  document: ProcessMapDocument | null;
}

export interface InitiativesSessionOutput {
  savedAt: string;
  workflowId: string;
  document: InitiativeInventory | null;
  pipelinePayload: string;
}

export interface AgentSessionOutputs {
  scoping?: ScopingSessionOutput;
  "live-interview"?: InterviewSessionOutput;
  "process-mapping"?: ProcessMapSessionOutput;
  "improvement-initiatives"?: InitiativesSessionOutput;
}

export interface SavedEngagement {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  companyName: string;
  industryId: string;
  functionId: string;
  workflowId?: string;
  roleId?: string;
  outputs: AgentSessionOutputs;
}

export const UPSTREAM_AGENT: Partial<Record<PlatformAgentSlug, PlatformAgentSlug>> = {
  "live-interview": "scoping",
  "process-mapping": "live-interview",
  "improvement-initiatives": "process-mapping",
};

export const AGENT_SLUG_LABELS: Record<PlatformAgentSlug, string> = {
  scoping: "Scoping",
  "live-interview": "Interview (Walter)",
  "process-mapping": "Process Mapping",
  "improvement-initiatives": "Initiatives",
};
