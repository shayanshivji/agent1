import type {
  AgentSessionOutputs,
  PlatformAgentSlug,
  SavedEngagement,
  ScopingSessionOutput,
} from "@/types/platform-session";
import { extractQuestionsFromGuide, guideToHandoffPayload } from "@/lib/pipeline/guide-handoff";
import type { InterviewGuide } from "@/types/guide";

/** Lazy store access avoids circular import crashes in the client bundle. */
function getGuideStore() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@/store/guide-store").useGuideStore as typeof import("@/store/guide-store").useGuideStore;
}

function getInterviewStore() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@/store/interview-execution-store").useInterviewStore as typeof import("@/store/interview-execution-store").useInterviewStore;
}

function getProcessMapStore() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@/store/process-map-store").useProcessMapStore as typeof import("@/store/process-map-store").useProcessMapStore;
}

function getInitiativeStore() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@/store/initiative-store").useInitiativeStore as typeof import("@/store/initiative-store").useInitiativeStore;
}

function getProcessMapLogic() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("@/lib/process-map/logic") as typeof import("@/lib/process-map/logic");
}

export function captureAgentSnapshot(slug: PlatformAgentSlug): Partial<AgentSessionOutputs> {
  const now = new Date().toISOString();

  if (slug === "scoping") {
    const s = getGuideStore().getState();
    const output: ScopingSessionOutput = {
      savedAt: now,
      companyName: s.companyName,
      industryId: s.industryId,
      functionId: s.functionId,
      workflowId: s.workflowId,
      roleId: s.roleId,
      level: s.level,
      customNotes: s.customNotes,
      guide: s.guide,
    };
    return { scoping: output };
  }

  if (slug === "live-interview") {
    const s = getInterviewStore().getState();
    return {
      "live-interview": {
        savedAt: now,
        mode: s.mode,
        workflowId: s.workflowId,
        roleId: s.roleId,
        stakeholderName: s.stakeholderName,
        guidePayload: s.guidePayload,
        transcriptText: s.transcriptText,
        liveTurns: s.liveTurns,
        document: s.document,
      },
    };
  }

  if (slug === "process-mapping") {
    const s = getProcessMapStore().getState();
    return {
      "process-mapping": {
        savedAt: now,
        workflowId: s.workflowId,
        guidePayload: s.pipelinePayload,
        document: s.document,
      },
    };
  }

  const s = getInitiativeStore().getState();
  return {
    "improvement-initiatives": {
      savedAt: now,
      workflowId: s.workflowId,
      document: s.inventory,
      pipelinePayload: s.pipelinePayload,
    },
  };
}

export function applyScopingToInterview(scoping: ScopingSessionOutput) {
  const interview = getInterviewStore().getState();
  interview.setCompanyName(scoping.companyName);
  interview.setIndustryId(scoping.industryId);
  interview.setFunctionId(scoping.functionId);
  interview.setWorkflowId(scoping.workflowId);
  interview.setRoleId(scoping.roleId);
  interview.setCustomNotes(scoping.customNotes);

  if (scoping.guide) {
    const questions = extractQuestionsFromGuide(scoping.guide);
    getInterviewStore().setState({
      guidePayload: guideToHandoffPayload(scoping.guide),
      guideQuestions: questions,
      linkedGuideId: scoping.guide.id,
      guideSource: "scoping",
      inputMode: "pipeline",
    });
  }
}

export function applyScopingGuide(guide: InterviewGuide, ctx: {
  companyName: string;
  industryId: string;
  functionId: string;
  workflowId: string;
  roleId: string;
  customNotes: string;
}) {
  applyScopingToInterview({
    savedAt: new Date().toISOString(),
    ...ctx,
    level: "deep_dive",
    guide,
  });
}

export function applyInterviewToProcessMap(output: NonNullable<AgentSessionOutputs["live-interview"]>) {
  const store = getProcessMapStore().getState();
  if (output.document) {
    store.setCompanyName(output.document.companyName ?? store.companyName);
    store.setWorkflowId(output.document.workflowId);
    const pkg = {
      sourceAgent: "live-interview" as const,
      workflowId: output.document.workflowId,
      workflowName: output.document.workflowName,
      processSteps: output.document.workflowSteps.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        systems: s.systems,
        ownerRole: s.actorRole,
      })),
      painPoints: output.document.painPoints.map((p) => ({
        id: p.id,
        workflowId: output.document!.workflowId,
        processStepIds: p.processStepIds,
        title: p.title,
        description: p.description,
        severity: p.severity,
        evidenceSnippet: p.description,
      })),
      interviewNotes: output.document.executiveSummary,
      processMapText: output.document.executiveSummary,
    };
    store.setPipelinePayload(JSON.stringify(pkg, null, 2));
    store.setInputMode("pipeline");
  } else if (output.guidePayload) {
    store.setPipelinePayload(output.guidePayload);
    store.setInputMode("pipeline");
  }
  if (output.transcriptText) store.setPastedNotes(output.transcriptText);
}

export function applyProcessMapToInitiatives(output: NonNullable<AgentSessionOutputs["process-mapping"]>) {
  const { toPipelineHandoff } = getProcessMapLogic();
  const store = getInitiativeStore().getState();
  store.setWorkflowId(output.workflowId);
  if (output.document) {
    store.setPipelinePayload(JSON.stringify(toPipelineHandoff(output.document), null, 2));
    store.setInputMode("pipeline");
  } else if (output.guidePayload) {
    store.setPipelinePayload(output.guidePayload);
    store.setInputMode("pipeline");
  }
}

export function applyUpstreamForAgent(slug: PlatformAgentSlug, session: SavedEngagement) {
  if (slug === "live-interview" && session.outputs.scoping) {
    applyScopingToInterview(session.outputs.scoping);
    return true;
  }
  if (slug === "process-mapping" && session.outputs["live-interview"]) {
    applyInterviewToProcessMap(session.outputs["live-interview"]);
    return true;
  }
  if (slug === "process-mapping" && session.outputs.scoping && !session.outputs["live-interview"]) {
    const scoping = session.outputs.scoping;
    const store = getProcessMapStore().getState();
    store.setCompanyName(scoping.companyName);
    store.setIndustryId(scoping.industryId);
    store.setFunctionId(scoping.functionId);
    store.setWorkflowId(scoping.workflowId);
    if (scoping.guide) {
      store.setPastedNotes(scoping.guide.sections.map((s) => s.content).join("\n"));
    }
    return true;
  }
  if (slug === "improvement-initiatives" && session.outputs["process-mapping"]) {
    applyProcessMapToInitiatives(session.outputs["process-mapping"]);
    return true;
  }
  return false;
}

export function getSessionSummary(session: SavedEngagement): string {
  const parts: string[] = [session.companyName || "Engagement"];
  if (session.outputs.scoping?.guide) parts.push("Guide");
  if (session.outputs["live-interview"]?.document) parts.push("Interview");
  if (session.outputs["process-mapping"]?.document) parts.push("Process map");
  if (session.outputs["improvement-initiatives"]?.document) parts.push("Initiatives");
  return parts.join(" · ");
}

export function readLiveScopingGuide(): InterviewGuide | null {
  return getGuideStore().getState().guide;
}

export function readLiveScopingContext() {
  const s = getGuideStore().getState();
  return {
    companyName: s.companyName,
    industryId: s.industryId,
    functionId: s.functionId,
    workflowId: s.workflowId,
    roleId: s.roleId,
    customNotes: s.customNotes,
  };
}
