export type InterviewLevel = "intro" | "deep_dive" | "validation";

export type GuideSectionId =
  | "objective"
  | "role_snapshot"
  | "known_facts"
  | "need_to_confirm"
  | "primary_questions"
  | "follow_up_probes"
  | "pain_points_to_test"
  | "systems_references"
  | "evidence_to_capture"
  | "fact_base_sizing"
  | "likely_outputs"
  | "dependencies_handoffs"
  | "red_flags"
  | "closeout";

export interface GuideSectionDefinition {
  id: GuideSectionId;
  title: string;
  description: string;
}

export const GUIDE_SECTIONS: GuideSectionDefinition[] = [
  { id: "objective", title: "Interview objective", description: "What this session must establish" },
  { id: "role_snapshot", title: "Role snapshot", description: "How this SME fits in the workflow" },
  { id: "known_facts", title: "What we already know", description: "From materials and prior work" },
  { id: "need_to_confirm", title: "What we need to confirm", description: "Open hypotheses to validate" },
  { id: "primary_questions", title: "Primary questions", description: "Core open-ended questions" },
  { id: "follow_up_probes", title: "Follow-up probes", description: "Depth probes for vague answers" },
  { id: "pain_points_to_test", title: "Pain points to test", description: "Specific friction to explore" },
  { id: "systems_references", title: "Systems & process references", description: "Tools, queues, handoffs to ask about" },
  { id: "evidence_to_capture", title: "Evidence to capture", description: "Data, examples, metrics to collect" },
  { id: "fact_base_sizing", title: "Fact-base & value sizing", description: "Fields needed for downstream value model and initiative sizing" },
  { id: "likely_outputs", title: "Likely outputs", description: "What this interview should produce" },
  { id: "dependencies_handoffs", title: "Dependencies & handoffs", description: "Upstream/downstream roles" },
  { id: "red_flags", title: "Red flags & contradictions", description: "Listen for inconsistencies" },
  { id: "closeout", title: "Closeout & validation", description: "Wrap-up and next steps" },
];

export interface Workflow {
  id: string;
  name: string;
  description: string;
  typicalSystems: string[];
  seedContext: string;
}

export interface Role {
  id: string;
  name: string;
  pod: string;
  description: string;
}

export interface SourceDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  extractedText: string;
  charCount: number;
}

export interface ExtractedContext {
  summary: string;
  keyTerms: string[];
  painPointHints: string[];
  systemHints: string[];
}

export interface InterviewSection {
  id: GuideSectionId;
  title: string;
  content: string;
  bullets?: string[];
}

export type ReviewStatus = "draft" | "in_review" | "validated";

export interface InterviewGuide {
  id: string;
  workflowId: string;
  /** All scoped workflows when multi-select is used; primary is workflowId. */
  workflowIds?: string[];
  workflowName: string;
  roleId: string;
  roleName: string;
  level: InterviewLevel;
  sections: InterviewSection[];
  reviewStatus: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  customNotes?: string;
  interviewObjective?: string;
  companyName?: string;
  industryId?: string;
  functionId?: string;
}

export interface VersionHistoryEntry {
  id: string;
  guideId: string;
  label: string;
  savedAt: string;
  guide: InterviewGuide;
}

export interface GuideGenerationRequest {
  workflowId: string;
  roleId: string;
  level: InterviewLevel;
  customNotes?: string;
  sources: SourceDocument[];
  extractedContext?: ExtractedContext;
}
