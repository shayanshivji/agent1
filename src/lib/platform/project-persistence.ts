import { WORKFLOW_STEPS, workflowHref } from "@/data/workflow-pipeline";
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

function stepHasOutput(outputs: AgentSessionOutputs, slug: PlatformAgentSlug): boolean {
  const out = outputs[slug];
  if (!out) return false;
  if (slug === "scoping") return Boolean(outputs.scoping?.guide);
  return Boolean("document" in out && out.document);
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

function isWorkflowStepComplete(
  outputs: AgentSessionOutputs,
  step: (typeof WORKFLOW_STEPS)[number],
): boolean {
  if (!step.agentSlug) return false;
  return stepHasOutput(outputs, step.agentSlug);
}

export function computeProjectProgress(outputs: AgentSessionOutputs): number {
  const progress = WORKFLOW_STEPS.reduce((sum, step) => {
    if (isWorkflowStepComplete(outputs, step)) {
      return sum + step.progressWeight;
    }
    return sum;
  }, 0);

  return Math.min(100, progress);
}

export function inferProjectStatus(progress: number, outputs: AgentSessionOutputs): ProjectStatus {
  if (outputs["improvement-initiatives"]?.document) return "sizing";
  if (outputs["process-mapping"]?.document) return "diagnosis";
  if (outputs.scoping?.guide || outputs["live-interview"]?.document) return "discovery";
  if (progress >= 90) return "complete";
  return "discovery";
}

export function inferStudyStage(outputs: AgentSessionOutputs): string {
  for (const step of WORKFLOW_STEPS) {
    if (!isWorkflowStepComplete(outputs, step)) return step.label;
  }
  return WORKFLOW_STEPS[WORKFLOW_STEPS.length - 1].label;
}

export function getMissingOutputLabels(outputs: AgentSessionOutputs): string[] {
  return WORKFLOW_STEPS.filter((step) => !isWorkflowStepComplete(outputs, step)).map(
    (s) => s.label,
  );
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
  const { outputs, id: projectId } = project;

  return WORKFLOW_STEPS.map((step) => {
    const href = workflowHref(projectId, step);

    if (step.id === "scoping") {
      return {
        id: step.id,
        title: step.label,
        ready: Boolean(outputs.scoping?.guide),
        updatedAt: outputs.scoping?.savedAt,
        detail: outputs.scoping?.guide
          ? `${outputs.scoping.guide.workflowName} · ${outputs.scoping.guide.roleName}`
          : "Not generated",
        href,
      };
    }

    if (step.agentSlug === "live-interview") {
      return {
        id: step.id,
        title: step.label,
        ready: Boolean(outputs["live-interview"]?.document),
        updatedAt: outputs["live-interview"]?.savedAt,
        detail: outputs["live-interview"]?.document
          ? `${outputs["live-interview"].document!.painPoints.length} pain points · ${outputs["live-interview"].document!.coverage.score}% coverage`
          : "Not processed",
        href,
      };
    }

    if (step.agentSlug === "process-mapping") {
      return {
        id: step.id,
        title: step.label,
        ready: Boolean(outputs["process-mapping"]?.document),
        updatedAt: outputs["process-mapping"]?.savedAt,
        detail: outputs["process-mapping"]?.document
          ? `${outputs["process-mapping"].document!.steps.length} steps · ${outputs["process-mapping"].document!.painPoints.length} pains`
          : "Not generated",
        href,
      };
    }

    if (step.agentSlug === "improvement-initiatives") {
      return {
        id: step.id,
        title: step.label,
        ready: Boolean(outputs["improvement-initiatives"]?.document),
        updatedAt: outputs["improvement-initiatives"]?.savedAt,
        detail: outputs["improvement-initiatives"]?.document
          ? `${outputs["improvement-initiatives"].document!.initiatives.length} initiatives`
          : "Not generated",
        href,
      };
    }

    return {
      id: step.id,
      title: step.label,
      ready: false,
      updatedAt: undefined,
      detail: "Not started",
      href,
    };
  });
}
