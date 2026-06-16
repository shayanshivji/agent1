import type { PlatformAgentSlug } from "@/types/platform-session";

export type WorkflowStepStatus = "live" | "planned";

export interface WorkflowStep {
  id: string;
  order: number;
  /** Value-creation step shown in the left rail */
  label: string;
  shortLabel: string;
  /** Agent or capability subtitle under the step name */
  agentLabel: string;
  description: string;
  /** Agent slug when live; null for planned-only steps */
  agentSlug: PlatformAgentSlug | null;
  status: WorkflowStepStatus;
  /** Optional tab hint for agents with multiple views */
  agentTab?: string;
}

/** Value creation steps — aligned to kickoff deck (page 8). */
export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: "scoping",
    order: 1,
    label: "Scoping",
    shortLabel: "Scoping",
    agentLabel: "Interview guide agent",
    description: "Discovery scope, interview guides, and fact-base requirements",
    agentSlug: "scoping",
    status: "live",
  },
  {
    id: "live-interview",
    order: 2,
    label: "Diagnostic Interviews",
    shortLabel: "Interviews",
    agentLabel: "SME capture · live & transcript",
    description: "Structured diagnostic interviews with evidence registry and guide coverage",
    agentSlug: "live-interview",
    status: "live",
  },
  {
    id: "process-mapping",
    order: 3,
    label: "Current-State Workflow and Pain Points",
    shortLabel: "Current state",
    agentLabel: "Process map + pain register",
    description: "Swimlanes, systems, handoffs, and pain points tied to workflow steps",
    agentSlug: "process-mapping",
    status: "live",
  },
  {
    id: "improvement-initiatives",
    order: 4,
    label: "Improvement Initiative Identification",
    shortLabel: "Initiatives",
    agentLabel: "Initiative generation agent",
    description: "Horizon-tagged initiatives mapped to pain points and value levers",
    agentSlug: "improvement-initiatives",
    status: "live",
  },
  {
    id: "value-modeling",
    order: 5,
    label: "Value Estimation and Initiative Prioritization",
    shortLabel: "Value",
    agentLabel: "Sizing & prioritization",
    description: "Size opportunities and prioritize initiatives by value at stake",
    agentSlug: null,
    status: "planned",
  },
  {
    id: "roadmap",
    order: 6,
    label: "Roadmap and Future State Mapping",
    shortLabel: "Roadmap",
    agentLabel: "Horizon plan & target state",
    description: "Sequence initiatives across horizons and define future-state requirements",
    agentSlug: null,
    status: "planned",
  },
  {
    id: "brd",
    order: 7,
    label: "BRD / Business Requirement Definition",
    shortLabel: "BRD",
    agentLabel: "Requirements & design pack",
    description: "Business requirement definition and design documentation for build",
    agentSlug: null,
    status: "planned",
  },
];

export function getWorkflowStep(id: string): WorkflowStep | undefined {
  return WORKFLOW_STEPS.find((s) => s.id === id);
}

export function getWorkflowStepByAgentSlug(slug: PlatformAgentSlug): WorkflowStep | undefined {
  return WORKFLOW_STEPS.find((s) => s.agentSlug === slug);
}

export function workflowHref(projectId: string, step: WorkflowStep): string {
  if (step.status === "live" && step.agentSlug) {
    const tab = step.agentTab ? `?tab=${step.agentTab}` : "";
    return `/projects/${projectId}/agents/${step.agentSlug}${tab}`;
  }
  return `/projects/${projectId}?step=${step.id}`;
}
