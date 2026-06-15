import type { AgentSessionOutputs } from "@/types/platform-session";

export type ProjectStatus = "discovery" | "diagnosis" | "sizing" | "roadmap" | "complete";

export interface ProjectSourceFile {
  id: string;
  name: string;
  uploadedAt: string;
  sizeBytes?: number;
  note?: string;
}

export interface FeedbackEntry {
  id: string;
  agentSlug: string | null;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  action?: "clarify" | "regenerate" | "correction" | "note";
}

/** Study project — top-level container for all agent outputs and context. */
export interface StudyProject {
  id: string;
  name: string;
  clientName: string;
  status: ProjectStatus;
  /** Human-readable study stage label for leadership view */
  studyStage: string;
  /** 0–100 completion across workflow steps */
  progress: number;
  createdAt: string;
  updatedAt: string;
  industryId: string;
  functionId: string;
  workflowId: string;
  notes: string;
  outputs: AgentSessionOutputs;
  sourceFiles: ProjectSourceFile[];
  feedbackLog: FeedbackEntry[];
}

export interface CreateProjectInput {
  name: string;
  clientName: string;
  industryId?: string;
  functionId?: string;
  workflowId?: string;
}
