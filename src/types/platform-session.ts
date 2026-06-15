import type { InterviewGuide } from "@/types/guide";
import type {
  InterviewExecutionDocument,
  GuideQuestionItem,
  LiveTurn,
} from "@/types/interview-execution";
import type { ProcessMapDocument } from "@/types/process-map";
import type { PainPoint, ProcessStep } from "@/types/pipeline";
import type { InitiativeInventory, InputMode } from "@/types/initiative";

export const UPSTREAM_DECLINED_NONE = "__none__";

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
  inputMode: InputMode;
  workflowId: string;
  roleId: string;
  stakeholderName: string;
  guidePayload: string;
  guideQuestions: GuideQuestionItem[];
  linkedGuideId: string | null;
  linkedGuideUpdatedAt: string | null;
  guideSource: "scoping" | "manual" | null;
  transcriptText: string;
  liveTurns: LiveTurn[];
  document: InterviewExecutionDocument | null;
}

export interface ProcessMapSessionOutput {
  savedAt: string;
  workflowId: string;
  companyName: string;
  industryId: string;
  functionId: string;
  inputMode: InputMode;
  pipelinePayload: string;
  pastedNotes: string;
  customNotes: string;
  document: ProcessMapDocument | null;
}

export interface InitiativesSessionOutput {
  savedAt: string;
  workflowId: string;
  companyName: string;
  industryId: string;
  functionId: string;
  inputMode: InputMode;
  processMapText: string;
  customNotes: string;
  document: InitiativeInventory | null;
  pipelinePayload: string;
  processSteps: ProcessStep[];
  painPoints: PainPoint[];
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
