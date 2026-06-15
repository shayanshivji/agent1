import type { PlatformAgentSlug } from "@/types/platform-session";

export type WorkflowStepStatus = "live" | "planned";

export interface WorkflowStep {
  id: string;
  order: number;
  label: string;
  shortLabel: string;
  description: string;
  /** Agent slug when live; null for planned-only steps */
  agentSlug: PlatformAgentSlug | null;
  status: WorkflowStepStatus;
  /** Optional tab hint for agents with multiple views */
  agentTab?: string;
}

/** Left-rail pipeline aligned to product direction + existing live agents. */
export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: "scoping",
    order: 1,
    label: "Scoping / Interview Guide",
    shortLabel: "Scoping",
    description: "Discovery scope, SME interview guides, fact-base requirements",
    agentSlug: "scoping",
    status: "live",
  },
  {
    id: "live-interview",
    order: 2,
    label: "Interview Execution",
    shortLabel: "Walter",
    description: "Live or transcript SME interviews with evidence registry",
    agentSlug: "live-interview",
    status: "live",
  },
  {
    id: "process-mapping",
    order: 3,
    label: "Current-State Process Mapping",
    shortLabel: "Process map",
    description: "Swimlanes, steps, systems, and handoffs from the fact base",
    agentSlug: "process-mapping",
    status: "live",
  },
  {
    id: "pain-synthesis",
    order: 4,
    label: "Pain Point Synthesis",
    shortLabel: "Pain points",
    description: "Consolidated pain register with severity and evidence",
    agentSlug: "process-mapping",
    status: "live",
    agentTab: "pain",
  },
  {
    id: "improvement-initiatives",
    order: 5,
    label: "Improvement Initiative Generation",
    shortLabel: "Initiatives",
    description: "Process-driven initiatives mapped to pain and value levers",
    agentSlug: "improvement-initiatives",
    status: "live",
  },
  {
    id: "value-modeling",
    order: 6,
    label: "Value Modeling",
    shortLabel: "Value",
    description: "Size opportunities and build the value-at-stake view",
    agentSlug: null,
    status: "planned",
  },
  {
    id: "roadmapping",
    order: 7,
    label: "Horizon / Roadmap",
    shortLabel: "Roadmap",
    description: "Sequence initiatives across H1–H3 with dependencies",
    agentSlug: null,
    status: "planned",
  },
  {
    id: "future-state",
    order: 8,
    label: "Future State / BRD",
    shortLabel: "Future state",
    description: "Target-state design and business requirements for implementation",
    agentSlug: null,
    status: "planned",
  },
];

export function getWorkflowStep(id: string): WorkflowStep | undefined {
  return WORKFLOW_STEPS.find((s) => s.id === id);
}

export function getWorkflowStepByAgentSlug(slug: PlatformAgentSlug): WorkflowStep | undefined {
  return WORKFLOW_STEPS.find((s) => s.agentSlug === slug && s.id === slug) ??
    WORKFLOW_STEPS.find((s) => s.agentSlug === slug);
}

export function workflowHref(projectId: string, step: WorkflowStep): string {
  if (step.status === "live" && step.agentSlug) {
    const tab = step.agentTab ? `?tab=${step.agentTab}` : "";
    return `/projects/${projectId}/agents/${step.agentSlug}${tab}`;
  }
  return `/projects/${projectId}?step=${step.id}`;
}
