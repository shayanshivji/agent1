export type AgentStatus = "live" | "building" | "planned";

export interface AgentDefinition {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  status: AgentStatus;
  description: string;
  blueprintSummary: string;
  href: string;
}

/** Canonical roster, matches Agent Blueprint Library (7 agents). */
export const AGENT_ROSTER: AgentDefinition[] = [
  {
    id: 1,
    slug: "scoping",
    name: "Scoping Agent",
    shortName: "Scoping",
    status: "live",
    description:
      "Ingest context, surface workflows, and produce tailored interview guides with fact-base requirements for value sizing.",
    blueprintSummary:
      "Defines discovery scope; produces interview guides and mapped fact-base for downstream agents.",
    href: "/agents/scoping",
  },
  {
    id: 2,
    slug: "live-interview",
    name: "Live Interview Agent",
    shortName: "Walter",
    status: "live",
    description:
      "Execute live or transcript-based SME interviews with coverage tracking, evidence registry, and Agent 3 handoff.",
    blueprintSummary:
      "Interview intelligence system: extracts workflow, pain points, handoffs, and evidence for process mapping.",
    href: "/agents/live-interview",
  },
  {
    id: 3,
    slug: "process-mapping",
    name: "Process Mapping Agent",
    shortName: "ProcessAI",
    status: "live",
    description:
      "Transform interview notes and transcripts into current-state process maps with pain points, swimlanes, and pipeline handoff to initiatives.",
    blueprintSummary:
      "ProcessAI-style current-state mapping from interview outputs; exports pipeline JSON for Agent 4.",
    href: "/agents/process-mapping",
  },
  {
    id: 4,
    slug: "improvement-initiatives",
    name: "Improvement Initiatives Agent",
    shortName: "Initiatives",
    status: "live",
    description:
      "Generate improvement initiatives from process maps and interview evidence with impact sizing.",
    blueprintSummary:
      "Process-driven initiatives tied to pain points, standalone or pipeline from Agents 1–3.",
    href: "/agents/improvement-initiatives",
  },
  {
    id: 5,
    slug: "future-state",
    name: "Future State Process Map Agent",
    shortName: "Future State",
    status: "planned",
    description: "Design target-state workflows from validated improvement opportunities.",
    blueprintSummary: "Future-state maps separate from initiatives (may combine with Agent 4 later).",
    href: "/agents/future-state",
  },
  {
    id: 6,
    slug: "roadmapping",
    name: "Roadmapping Agent",
    shortName: "Roadmap",
    status: "planned",
    description: "Sequence initiatives into H1–H3 execution roadmap with dependencies.",
    blueprintSummary: "H1–H3 roadmapping from sized initiatives.",
    href: "/agents/roadmapping",
  },
  {
    id: 7,
    slug: "brd-drafting",
    name: "BRD Drafting Agent",
    shortName: "BRD",
    status: "planned",
    description: "Draft business requirements documents from approved future-state designs.",
    blueprintSummary: "BRD generation for implementation handoff.",
    href: "/agents/brd-drafting",
  },
];

export function getAgentBySlug(slug: string): AgentDefinition | undefined {
  return AGENT_ROSTER.find((a) => a.slug === slug);
}

export function getLiveAgents(): AgentDefinition[] {
  return AGENT_ROSTER.filter((a) => a.status === "live");
}
