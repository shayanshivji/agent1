import { BSN_PRESET } from "@/data/engagement-context";
import { getSeedForWorkflow } from "@/data/initiative-seeds";
import { getWorkflow, getRole } from "@/data/catalog";
import { buildInventoryFromResponse, templateInitiatives } from "@/lib/initiatives/logic";
import { templateInterviewDocument } from "@/lib/interview-execution/logic";
import { templateProcessMap } from "@/lib/process-map/logic";
import {
  extractQuestionsFromGuide,
  guideToHandoffPayload,
} from "@/lib/pipeline/guide-handoff";
import { templateGuide } from "@/lib/prompts/interview-guide";
import {
  computeProjectProgress,
  inferProjectStatus,
  inferStudyStage,
} from "@/lib/platform/project-persistence";
import type { InterviewGuide, InterviewLevel } from "@/types/guide";
import type { AgentSessionOutputs } from "@/types/platform-session";
import type { StudyProject } from "@/types/project";
import { GUIDE_SECTIONS } from "@/types/guide";

/** Stable id — use in links: /projects/demo-bsn-mts-study */
export const DEMO_PROJECT_ID = "demo-bsn-mts-study";

/** Bump to refresh demo outputs for all users on next load. */
export const DEMO_SEED_VERSION = 2;

const WORKFLOW_ID = "mts-shop-build";
const ROLE_ID = "mts-pod";
const LEVEL: InterviewLevel = "deep_dive";

const DEMO_OBJECTIVE =
  "Map the MTS shop-build workflow end-to-end, quantify pain in Engage intake handoffs, and identify H1 quick wins ahead of Fall peak season.";

const DEMO_NOTES =
  "Demo study — pre-loaded template outputs for walkthroughs. No API key required.";

function buildDemoGuide(): InterviewGuide {
  const engagement = { ...BSN_PRESET };
  const template = templateGuide({
    workflowId: WORKFLOW_ID,
    roleId: ROLE_ID,
    level: LEVEL,
    engagement,
  });
  const workflow = getWorkflow(WORKFLOW_ID, engagement);
  const role = getRole(ROLE_ID, engagement);
  const now = "2026-06-01T12:00:00.000Z";

  const sections = GUIDE_SECTIONS.map((def) => {
    const fromTemplate = template.sections.find((s) => s.id === def.id);
    return {
      id: def.id,
      title: def.title,
      content: fromTemplate?.content ?? "",
      bullets: def.id === "objective" ? undefined : fromTemplate?.bullets,
    };
  });

  // Objective is narrative-only per product UX
  const objective = sections.find((s) => s.id === "objective");
  if (objective) {
    objective.content = DEMO_OBJECTIVE;
    objective.bullets = undefined;
  }

  return {
    id: "demo-guide-mts",
    workflowId: WORKFLOW_ID,
    workflowName: workflow?.name ?? "MTS Shop Build",
    roleId: ROLE_ID,
    roleName: role?.name ?? "MTS Pod Lead",
    level: LEVEL,
    sections,
    reviewStatus: "in_review",
    createdAt: now,
    updatedAt: now,
    customNotes: DEMO_NOTES,
    interviewObjective: DEMO_OBJECTIVE,
    companyName: BSN_PRESET.companyName,
    industryId: BSN_PRESET.industryId,
    functionId: BSN_PRESET.functionId,
  };
}

export function buildDemoAgentOutputs(): AgentSessionOutputs {
  const engagement = { ...BSN_PRESET };
  const savedAt = "2026-06-01T14:00:00.000Z";
  const guide = buildDemoGuide();
  const workflow = getWorkflow(WORKFLOW_ID, engagement);
  const role = getRole(ROLE_ID, engagement);

  const interviewDoc = templateInterviewDocument({
    mode: "transcript",
    inputMode: "pipeline",
    workflowId: WORKFLOW_ID,
    workflowName: workflow?.name ?? WORKFLOW_ID,
    roleId: ROLE_ID,
    roleName: role?.name ?? ROLE_ID,
    companyName: BSN_PRESET.companyName,
    stakeholderName: "Jordan M. (MTS Pod Lead)",
    transcriptText:
      "Demo transcript — SME walked through last week's shop build, Engage queue delays, and incomplete intake rework.",
    guide,
  });

  const processMapDoc = templateProcessMap({
    workflowId: WORKFLOW_ID,
    workflowName: workflow?.name ?? WORKFLOW_ID,
    companyName: BSN_PRESET.companyName,
    inputMode: "pipeline",
  });

  const seed = getSeedForWorkflow(WORKFLOW_ID);
  const { initiatives, mappings } = templateInitiatives({
    workflowId: WORKFLOW_ID,
    workflowName: workflow?.name ?? WORKFLOW_ID,
    processSteps: seed.processSteps,
    painPoints: seed.painPoints.map((p) => ({ ...p, workflowId: WORKFLOW_ID })),
  });

  const initiativeInventory = buildInventoryFromResponse(
    WORKFLOW_ID,
    engagement,
    "pipeline",
    "comprehensive",
    {
      processSteps: seed.processSteps,
      painPoints: seed.painPoints.map((p) => ({ ...p, workflowId: WORKFLOW_ID })),
      initiatives,
      mappings,
    },
    DEMO_NOTES,
    "template",
  );

  const guideQuestions = extractQuestionsFromGuide(guide);

  return {
    scoping: {
      savedAt,
      companyName: BSN_PRESET.companyName,
      industryId: BSN_PRESET.industryId,
      functionId: BSN_PRESET.functionId,
      workflowId: WORKFLOW_ID,
      roleId: ROLE_ID,
      level: LEVEL,
      customNotes: DEMO_NOTES,
      interviewObjective: DEMO_OBJECTIVE,
      guide,
    },
    "live-interview": {
      savedAt,
      mode: "live",
      inputMode: "pipeline",
      workflowId: WORKFLOW_ID,
      roleId: ROLE_ID,
      stakeholderName: "Jordan M. (MTS Pod Lead)",
      guidePayload: guideToHandoffPayload(guide),
      guideQuestions,
      linkedGuideId: guide.id,
      linkedGuideUpdatedAt: guide.updatedAt,
      guideSource: "scoping",
      transcriptText:
        "Demo transcript — SME walked through last week's shop build, Engage queue delays, and incomplete intake rework.",
      liveTurns: [],
      document: interviewDoc,
      activeRunId: "demo-interview-1",
      interviewRuns: [
        {
          id: "demo-interview-1",
          label: "Jordan M. (MTS Pod Lead)",
          stakeholderName: "Jordan M. (MTS Pod Lead)",
          roleId: ROLE_ID,
          mode: "live",
          transcriptText:
            "Demo transcript — SME walked through last week's shop build, Engage queue delays, and incomplete intake rework.",
          liveTurns: [],
          document: interviewDoc,
          guideQuestions,
          createdAt: savedAt,
          updatedAt: savedAt,
        },
      ],
    },
    "process-mapping": {
      savedAt,
      workflowId: WORKFLOW_ID,
      companyName: BSN_PRESET.companyName,
      industryId: BSN_PRESET.industryId,
      functionId: BSN_PRESET.functionId,
      inputMode: "pipeline",
      pipelinePayload: "",
      pastedNotes: "",
      customNotes: DEMO_NOTES,
      document: processMapDoc,
    },
    "improvement-initiatives": {
      savedAt,
      workflowId: WORKFLOW_ID,
      companyName: BSN_PRESET.companyName,
      industryId: BSN_PRESET.industryId,
      functionId: BSN_PRESET.functionId,
      inputMode: "pipeline",
      processMapText: "",
      customNotes: DEMO_NOTES,
      document: initiativeInventory,
      pipelinePayload: "",
      processSteps: seed.processSteps,
      painPoints: seed.painPoints.map((p) => ({ ...p, workflowId: WORKFLOW_ID })),
    },
  };
}

export function buildDemoStudyProject(): StudyProject {
  const outputs = buildDemoAgentOutputs();
  const progress = computeProjectProgress(outputs);
  const now = "2026-06-01T14:00:00.000Z";

  return {
    id: DEMO_PROJECT_ID,
    name: "BSN Sports Diagnostic & Design",
    clientName: BSN_PRESET.companyName,
    status: inferProjectStatus(progress, outputs),
    studyStage: inferStudyStage(outputs),
    progress,
    createdAt: now,
    updatedAt: now,
    industryId: BSN_PRESET.industryId,
    functionId: BSN_PRESET.functionId,
    workflowId: WORKFLOW_ID,
    notes: "Kickoff example — pre-loaded outputs across all live steps. Safe for internal walkthroughs.",
    outputs,
    sourceFiles: [
      {
        id: "demo-source-1",
        name: "BSN_Support_Teams_Overview.pdf",
        uploadedAt: now,
        note: "Demo reference doc (placeholder)",
      },
    ],
    feedbackLog: [
      {
        id: "demo-feedback-1",
        agentSlug: "scoping",
        role: "user",
        content: "Add more probes on Engage queue rework — intake incomplete forms are the #1 pain.",
        createdAt: now,
        action: "note",
      },
    ],
    isDemo: true,
    demoSeedVersion: DEMO_SEED_VERSION,
  };
}

export function ensureDemoInProjects(projects: StudyProject[]): StudyProject[] {
  const demo = buildDemoStudyProject();
  const idx = projects.findIndex((p) => p.id === DEMO_PROJECT_ID);

  if (idx === -1) {
    return [demo, ...projects];
  }

  const existing = projects[idx];
  const needsReseed =
    existing.isDemo !== false &&
    ((existing.demoSeedVersion ?? 0) < DEMO_SEED_VERSION || !existing.outputs.scoping?.guide);

  let list = projects;
  if (needsReseed) {
    list = projects.map((p) =>
      p.id === DEMO_PROJECT_ID
        ? {
            ...demo,
            createdAt: existing.createdAt,
            feedbackLog: existing.feedbackLog.length ? existing.feedbackLog : demo.feedbackLog,
          }
        : p,
    );
  }

  if (list[0]?.id === DEMO_PROJECT_ID) return list;

  const demoIdx = list.findIndex((p) => p.id === DEMO_PROJECT_ID);
  if (demoIdx <= 0) return list;
  const copy = [...list];
  const [demoProject] = copy.splice(demoIdx, 1);
  return [demoProject, ...copy];
}

export function isDemoProject(id: string): boolean {
  return id === DEMO_PROJECT_ID;
}
