import { WORKFLOW_STEPS } from "@/data/workflow-pipeline";
import type { StudyProject, ProjectStatus } from "@/types/project";
import type { AgentSessionOutputs, PlatformAgentSlug } from "@/types/platform-session";

const LIVE_AGENT_SLUGS: PlatformAgentSlug[] = [
  "scoping",
  "live-interview",
  "process-mapping",
  "improvement-initiatives",
];

function captureSnapshot(slug: PlatformAgentSlug) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { captureAgentSnapshot } = require("@/lib/platform/agent-snapshots") as typeof import("@/lib/platform/agent-snapshots");
  return captureAgentSnapshot(slug);
}

function restoreSnapshot(project: StudyProject, slug: PlatformAgentSlug) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { restoreAgentFromSession } = require("@/lib/platform/agent-snapshots") as typeof import("@/lib/platform/agent-snapshots");
  return restoreAgentFromSession(projectToEngagementShape(project), slug);
}

export function captureAllAgentOutputs(): AgentSessionOutputs {
  let merged: AgentSessionOutputs = {};
  for (const slug of LIVE_AGENT_SLUGS) {
    merged = { ...merged, ...captureSnapshot(slug) };
  }
  return merged;
}

export function restoreProjectIntoStores(project: StudyProject): void {
  for (const slug of LIVE_AGENT_SLUGS) {
    if (project.outputs[slug]) {
      restoreSnapshot(project, slug);
    }
  }
}

export function clearAllAgentStores(): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const guide = require("@/store/guide-store").useGuideStore.getState();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const interview = require("@/store/interview-execution-store").useInterviewStore.getState();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const processMap = require("@/store/process-map-store").useProcessMapStore.getState();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const initiatives = require("@/store/initiative-store").useInitiativeStore.getState();
  guide.reset();
  interview.reset();
  processMap.reset();
  initiatives.reset();
}

export function computeProjectProgress(outputs: AgentSessionOutputs): number {
  const liveSteps = WORKFLOW_STEPS.filter((s) => s.status === "live" && s.agentSlug);
  const seen = new Set<string>();
  let completed = 0;

  for (const step of liveSteps) {
    const key = step.agentSlug!;
    if (seen.has(key)) continue;
    seen.add(key);
    const out = outputs[key];
    if (!out) continue;
    const hasDoc =
      ("guide" in out && out.guide) ||
      ("document" in out && out.document) ||
      (key === "improvement-initiatives" && "document" in out && out.document);
    if (hasDoc) completed += 1;
  }

  const uniqueLiveAgents = new Set(liveSteps.map((s) => s.agentSlug).filter(Boolean));
  return uniqueLiveAgents.size
    ? Math.round((completed / uniqueLiveAgents.size) * 100)
    : 0;
}

export function inferProjectStatus(progress: number, outputs: AgentSessionOutputs): ProjectStatus {
  if (outputs["improvement-initiatives"]?.document) return "sizing";
  if (outputs["process-mapping"]?.document) return "diagnosis";
  if (outputs.scoping?.guide || outputs["live-interview"]?.document) return "discovery";
  if (progress >= 90) return "complete";
  return "discovery";
}

export function inferStudyStage(outputs: AgentSessionOutputs): string {
  if (outputs["improvement-initiatives"]?.document) return "Initiative sizing & prioritization";
  if (outputs["process-mapping"]?.document) return "Current-state diagnosis";
  if (outputs["live-interview"]?.document) return "Interview fact base";
  if (outputs.scoping?.guide) return "Discovery & scoping";
  return "Project setup";
}

export function projectToEngagementShape(project: StudyProject) {
  return {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    companyName: project.clientName,
    industryId: project.industryId,
    functionId: project.functionId,
    workflowId: project.workflowId,
    outputs: project.outputs,
  };
}

export function getOutputSummaries(project: StudyProject) {
  const { outputs } = project;
  return [
    {
      id: "scoping",
      title: "Interview guide",
      ready: Boolean(outputs.scoping?.guide),
      updatedAt: outputs.scoping?.savedAt,
      detail: outputs.scoping?.guide
        ? `${outputs.scoping.guide.workflowName} · ${outputs.scoping.guide.roleName}`
        : "Not generated",
    },
    {
      id: "live-interview",
      title: "Interview intelligence",
      ready: Boolean(outputs["live-interview"]?.document),
      updatedAt: outputs["live-interview"]?.savedAt,
      detail: outputs["live-interview"]?.document
        ? `${outputs["live-interview"].document!.painPoints.length} pain points · ${outputs["live-interview"].document!.coverage.score}% coverage`
        : "Not processed",
    },
    {
      id: "process-mapping",
      title: "Process map",
      ready: Boolean(outputs["process-mapping"]?.document),
      updatedAt: outputs["process-mapping"]?.savedAt,
      detail: outputs["process-mapping"]?.document
        ? `${outputs["process-mapping"].document!.steps.length} steps · ${outputs["process-mapping"].document!.painPoints.length} pains`
        : "Not generated",
    },
    {
      id: "improvement-initiatives",
      title: "Initiative inventory",
      ready: Boolean(outputs["improvement-initiatives"]?.document),
      updatedAt: outputs["improvement-initiatives"]?.savedAt,
      detail: outputs["improvement-initiatives"]?.document
        ? `${outputs["improvement-initiatives"].document!.initiatives.length} initiatives`
        : "Not generated",
    },
  ];
}
