import type { AgentDefinition } from "@/data/agent-roster";

export interface AgentLandingContent {
  tagline: string;
  heroSubtitle: string;
  problemStatement: string;
  capabilities: string[];
  inputs: string[];
  outputs: string[];
  upstreamAgents: number[];
  downstreamAgents: number[];
  modes?: string[];
  exportFormats?: string[];
}

export const AGENT_LANDING: Record<string, AgentLandingContent> = {
  scoping: {
    tagline: "Scope the diagnostic. Size the fact base.",
    heroSubtitle:
      "Generate role-specific SME interview guides with McKinsey-style structure, pain points to test, and fact-base requirements for downstream value sizing.",
    problemStatement:
      "Discovery starts scattered — notes in decks, tribal knowledge, no consistent interview structure. Teams lose weeks before the first SME conversation is properly scoped.",
    capabilities: [
      "Workflow and role-specific interview guides (14 structured sections)",
      "BSN seed catalog or generic templates by industry and function",
      "Template mode without API key; LLM mode with OpenAI",
      "Export to Markdown, Word, and PDF for field use",
    ],
    inputs: ["Engagement context", "Workflow selection", "Role and seniority", "Custom notes"],
    outputs: ["Interview guide", "Pain points to test", "Fact-base sizing section", "Handoff JSON"],
    upstreamAgents: [],
    downstreamAgents: [2, 3, 4],
    modes: ["Template", "LLM"],
    exportFormats: ["Markdown", "Word", "PDF"],
  },
  "live-interview": {
    tagline: "Run the interview. Capture the evidence.",
    heroSubtitle:
      "Conduct structured SME interviews with real-time probing, STAR-style follow-ups, and clean handoff to process mapping.",
    problemStatement:
      "Live interviews drift — inconsistent probing, poor note capture, and insights that don't map to process steps or pain points.",
    capabilities: [
      "Guide-driven interview flow from Agent 1",
      "Real-time probing and note capture",
      "Evidence tagging by process step",
      "Structured export for Process Mapping Agent",
    ],
    inputs: ["Approved interview guide", "Live transcript or notes"],
    outputs: ["Interview notes", "Evidence snippets", "Pain point signals"],
    upstreamAgents: [1],
    downstreamAgents: [3, 4],
  },
  "process-mapping": {
    tagline: "Map the current state. Surface the pain.",
    heroSubtitle:
      "Transform interview notes and transcripts into current-state process maps with systems, handoffs, and validated pain points.",
    problemStatement:
      "Process knowledge lives in people's heads and slide decks — not in a structured map that initiatives and roadmaps can consume.",
    capabilities: [
      "Current-state process maps from interview outputs",
      "Pain point linkage to process steps",
      "Systems and owner annotation",
      "Pipeline JSON for Initiative Agent",
    ],
    inputs: ["Interview outputs", "Transcripts", "Existing process docs"],
    outputs: ["Process steps", "Pain points", "Current-state map", "Pipeline JSON"],
    upstreamAgents: [1, 2],
    downstreamAgents: [4, 5, 6],
  },
  "improvement-initiatives": {
    tagline: "Turn pain points into a prioritized initiative inventory.",
    heroSubtitle:
      "Process-driven improvement initiatives mapped to steps and pain points — McKinsey two-lens framing, standalone or pipeline from Agents 1–3.",
    problemStatement:
      "Brainstormed initiative lists aren't tied to process evidence, lack horizon phasing, and can't feed value modeling or roadmapping.",
    capabilities: [
      "Standalone or pipeline mode from prior agent JSON",
      "Value blocker vs efficiency classification",
      "H1 / H2 / H3 horizon and lever-type filters",
      "Duplicate detection and inline editing",
      "Export Markdown, CSV, and pipeline JSON",
    ],
    inputs: ["Process maps", "Pain points", "Notes", "Uploaded docs", "Pipeline JSON"],
    outputs: ["Initiative inventory", "Pain-to-initiative mapping", "Horizon view", "Handoff JSON"],
    upstreamAgents: [1, 2, 3],
    downstreamAgents: [5, 6, 7],
    modes: ["Standalone", "Pipeline"],
    exportFormats: ["Markdown", "CSV", "JSON"],
  },
  "future-state": {
    tagline: "Design the target workflow.",
    heroSubtitle:
      "Build future-state process maps from validated improvement opportunities — separate from initiative inventory, ready for BRD and implementation.",
    problemStatement:
      "Initiatives describe what to fix; future-state maps show how work should flow after change — most teams conflate the two.",
    capabilities: [
      "Target-state workflow from sized initiatives",
      "Before/after process comparison",
      "Automation and decision-point design",
      "Handoff to roadmapping and BRD agents",
    ],
    inputs: ["Sized initiatives", "Current-state maps", "Constraints"],
    outputs: ["Future-state map", "Change deltas", "Automation points"],
    upstreamAgents: [4],
    downstreamAgents: [6, 7],
  },
  roadmapping: {
    tagline: "Sequence the work. Respect the capacity.",
    heroSubtitle:
      "Turn sized initiatives into an H1–H3 execution roadmap with dependencies, timing realism, and value realization tracking.",
    problemStatement:
      "Flat priority lists ignore renewals, team capacity, and dependency chains — roadmaps fail in the first quarter.",
    capabilities: [
      "H1 / H2 / H3 time-phased roadmap",
      "Dependency and timing dependency mapping",
      "Capacity-aware sequencing",
      "Value realization tie-in",
    ],
    inputs: ["Sized initiatives", "Dependencies", "Capacity constraints"],
    outputs: ["Execution roadmap", "Wave plan", "Milestone calendar"],
    upstreamAgents: [4, 5],
    downstreamAgents: [7],
  },
  "brd-drafting": {
    tagline: "Draft the requirements. Hand off to build.",
    heroSubtitle:
      "Generate business requirements documents from approved future-state designs — implementation-ready for tech and ops teams.",
    problemStatement:
      "Diagnostics end in slides; implementation teams need structured BRDs with scope, acceptance criteria, and system touchpoints.",
    capabilities: [
      "BRD sections from future-state design",
      "Acceptance criteria and scope boundaries",
      "System and integration requirements",
      "Export for implementation partners",
    ],
    inputs: ["Future-state maps", "Approved initiatives", "System inventory"],
    outputs: ["BRD document", "Requirements traceability"],
    upstreamAgents: [5, 6],
    downstreamAgents: [],
  },
};

export function getAgentLandingContent(slug: string): AgentLandingContent | undefined {
  return AGENT_LANDING[slug];
}

export function getAgentWorkspaceHref(slug: string): string {
  return `/agents/${slug}/workspace`;
}

export function getUpstreamAgents(agent: AgentDefinition) {
  const content = AGENT_LANDING[agent.slug];
  if (!content) return [];
  return content.upstreamAgents;
}

export function getDownstreamAgents(agent: AgentDefinition) {
  const content = AGENT_LANDING[agent.slug];
  if (!content) return [];
  return content.downstreamAgents;
}

export const PLATFORM_STATS = {
  totalAgents: 7,
  liveAgents: 2,
  diagnosticWeeks: "3",
  exportFormats: "MD · DOCX · PDF · CSV · JSON",
};

export const PLATFORM_PIPELINE = [
  { id: 1, label: "Scope", slug: "scoping" },
  { id: 2, label: "Interview", slug: "live-interview" },
  { id: 3, label: "Map", slug: "process-mapping" },
  { id: 4, label: "Initiatives", slug: "improvement-initiatives" },
  { id: 5, label: "Future state", slug: "future-state" },
  { id: 6, label: "Roadmap", slug: "roadmapping" },
  { id: 7, label: "BRD", slug: "brd-drafting" },
];
