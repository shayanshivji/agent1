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

/** Value creation steps — agents and views live within each step. */
export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: "scoping",
    order: 1,
    label: "Scoping",
    shortLabel: "Scoping",
    agentLabel: "Interview guide agent",
    description: "Discovery scope, SME interview guides, fact-base requirements",
    agentSlug: "scoping",
    status: "live",
  },
  {
    id: "live-interview",
    order: 2,
    label: "SME interviews",
    shortLabel: "Interviews",
    agentLabel: "Walter · live & transcript capture",
    description: "Structured SME sessions with evidence registry and guide coverage",
    agentSlug: "live-interview",
    status: "live",
  },
  {
    id: "process-mapping",
    order: 3,
    label: "Current state mapping & pain points",
    shortLabel: "Current state",
    agentLabel: "Process map + pain register",
    description: "Swimlanes, systems, handoffs, and consolidated pain synthesis",
    agentSlug: "process-mapping",
    status: "live",
  },
  {
    id: "improvement-initiatives",
    order: 4,
    label: "Improvement initiatives",
    shortLabel: "Initiatives",
    agentLabel: "Initiative generation agent",
    description: "Process-driven initiatives mapped to pain and value levers",
    agentSlug: "improvement-initiatives",
    status: "live",
  },
  {
    id: "value-modeling",
    order: 5,
    label: "Value modeling",
    shortLabel: "Value",
    agentLabel: "Sizing & value at stake",
    description: "Size opportunities and build the value-at-stake view",
    agentSlug: null,
    status: "planned",
  },
  {
    id: "roadmap",
    order: 6,
    label: "Roadmap & future state",
    shortLabel: "Roadmap",
    agentLabel: "Horizon plan & target state",
    description: "Sequence initiatives across horizons and define future-state requirements",
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
