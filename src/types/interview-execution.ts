import type { InputMode } from "@/types/initiative";

export type InterviewExecutionMode = "live" | "transcript";

export type ConfidenceLevel = "high" | "medium" | "low";

export type ValidationStatus = "draft" | "in_review" | "validated";

export type CoverageStatus = "covered" | "partial" | "missing";

export type InterviewTab =
  | "transcript"
  | "summary"
  | "workflow"
  | "pain"
  | "evidence"
  | "handoffs"
  | "open_questions"
  | "coverage"
  | "export";

export interface LiveTurn {
  id: string;
  speaker: "interviewer" | "interviewee";
  content: string;
  timestamp: string;
  topicTag?: string;
  guideQuestionId?: string;
}

export interface GuideQuestionItem {
  id: string;
  text: string;
  sectionId: string;
  sectionLabel: string;
  status: "pending" | "asked" | "answered";
  linkedTurnIds?: string[];
}

export interface EvidenceRecord {
  id: string;
  quote: string;
  source: string;
  section?: string;
  lineRef?: string;
  confidence: ConfidenceLevel;
  linkedFindingType?: "pain_point" | "workflow_step" | "handoff" | "opportunity" | "contradiction";
  linkedFindingId?: string;
}

export interface ProcessActivity {
  id: string;
  name: string;
  description: string;
  frequency?: string;
  evidenceIds: string[];
}

export interface InterviewWorkflowStep {
  id: string;
  name: string;
  description: string;
  sequence: number;
  actorRole?: string;
  systems: string[];
  evidenceIds: string[];
  confidence: ConfidenceLevel;
}

export interface InterviewSystem {
  id: string;
  name: string;
  usage: string;
  evidenceIds: string[];
}

export interface InterviewPainPoint {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  processStepIds: string[];
  evidenceIds: string[];
  confidence: ConfidenceLevel;
}

export interface InterviewOpportunity {
  id: string;
  title: string;
  description: string;
  evidenceIds: string[];
  confidence: ConfidenceLevel;
}

export interface InterviewHandoff {
  id: string;
  fromRole: string;
  toRole: string;
  description: string;
  trigger?: string;
  evidenceIds: string[];
  confidence: ConfidenceLevel;
}

export interface OpenQuestion {
  id: string;
  question: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

export interface Contradiction {
  id: string;
  topic: string;
  statementA: string;
  sourceA: string;
  statementB: string;
  sourceB: string;
  resolution?: string;
}

export interface CoverageTopic {
  id: string;
  name: string;
  status: CoverageStatus;
  linkedQuestion?: string;
  notes?: string;
}

export interface InterviewCoverage {
  score: number;
  objectivesFromGuide: string[];
  questionsAsked: string[];
  topics: CoverageTopic[];
  missingTopics: string[];
  suggestedFollowUps: string[];
}

export interface InterviewVersionEntry {
  id: string;
  label: string;
  savedAt: string;
  snapshot: InterviewExecutionDocument;
}

export interface InterviewExecutionDocument {
  id: string;
  mode: InterviewExecutionMode;
  inputMode: InputMode;
  workflowId: string;
  workflowName: string;
  roleId: string;
  roleName: string;
  stakeholderName?: string;
  companyName?: string;
  executiveSummary: string;
  processActivities: ProcessActivity[];
  workflowSteps: InterviewWorkflowStep[];
  systems: InterviewSystem[];
  painPoints: InterviewPainPoint[];
  opportunities: InterviewOpportunity[];
  handoffs: InterviewHandoff[];
  openQuestions: OpenQuestion[];
  contradictions: Contradiction[];
  evidenceRegistry: EvidenceRecord[];
  coverage: InterviewCoverage;
  transcriptRaw?: string;
  liveTurns: LiveTurn[];
  reviewStatus: ValidationStatus;
  createdAt: string;
  updatedAt: string;
  generationMode?: "llm" | "template";
}

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const COVERAGE_STATUS_LABELS: Record<CoverageStatus, string> = {
  covered: "Covered",
  partial: "Partial",
  missing: "Missing",
};
