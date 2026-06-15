import type {
  AgentSessionOutputs,
  PlatformAgentSlug,
  SavedEngagement,
  ScopingSessionOutput,
} from "@/types/platform-session";
import { UPSTREAM_DECLINED_NONE } from "@/types/platform-session";
import {
  extractQuestionsFromGuide,
  formatGuideSectionsForNotes,
  guideToHandoffPayload,
} from "@/lib/pipeline/guide-handoff";
import type { InterviewGuide, InterviewLevel } from "@/types/guide";
import type { InputMode } from "@/types/initiative";
import type { InterviewExecutionMode } from "@/types/interview-execution";

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
        inputMode: s.inputMode,
        workflowId: s.workflowId,
        roleId: s.roleId,
        stakeholderName: s.stakeholderName,
        guidePayload: s.guidePayload,
        guideQuestions: s.guideQuestions,
        linkedGuideId: s.linkedGuideId,
        linkedGuideUpdatedAt: s.linkedGuideUpdatedAt,
        guideSource: s.guideSource,
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
        companyName: s.companyName,
        industryId: s.industryId,
        functionId: s.functionId,
        inputMode: s.inputMode,
        pipelinePayload: s.pipelinePayload,
        pastedNotes: s.pastedNotes,
        customNotes: s.customNotes,
        document: s.document,
      },
    };
  }

  const s = getInitiativeStore().getState();
  return {
    "improvement-initiatives": {
      savedAt: now,
      workflowId: s.workflowId,
      companyName: s.companyName,
      industryId: s.industryId,
      functionId: s.functionId,
      inputMode: s.inputMode,
      processMapText: s.processMapText,
      customNotes: s.customNotes,
      document: s.inventory,
      pipelinePayload: s.pipelinePayload,
      processSteps: s.processSteps,
      painPoints: s.painPoints,
    },
  };
}

export function restoreAgentFromSession(
  session: SavedEngagement,
  slug: PlatformAgentSlug,
): boolean {
  const output = session.outputs[slug];
  if (!output) return false;

  if (slug === "scoping" && session.outputs.scoping) {
    const s = session.outputs.scoping;
    getGuideStore().setState({
      companyName: s.companyName,
      industryId: s.industryId,
      functionId: s.functionId,
      workflowId: s.workflowId,
      roleId: s.roleId,
      level: s.level as InterviewLevel,
      customNotes: s.customNotes,
      guide: s.guide,
      error: null,
      isGenerating: false,
    });
    return Boolean(s.guide);
  }

  if (slug === "live-interview" && session.outputs["live-interview"]) {
    const o = session.outputs["live-interview"];
    getInterviewStore().setState({
      companyName: session.companyName || o.document?.companyName || getInterviewStore().getState().companyName,
      industryId: session.industryId || getInterviewStore().getState().industryId,
      functionId: session.functionId || getInterviewStore().getState().functionId,
      workflowId: o.workflowId,
      roleId: o.roleId,
      mode: o.mode as InterviewExecutionMode,
      inputMode: o.inputMode ?? "pipeline",
      stakeholderName: o.stakeholderName,
      guidePayload: o.guidePayload,
      guideQuestions: o.guideQuestions ?? [],
      linkedGuideId: o.linkedGuideId ?? null,
      linkedGuideUpdatedAt: o.linkedGuideUpdatedAt ?? null,
      guideSource: o.guideSource ?? null,
      transcriptText: o.transcriptText,
      liveTurns: o.liveTurns ?? [],
      document: o.document,
      error: null,
      isGenerating: false,
      isSuggesting: false,
    });
    return Boolean(o.document);
  }

  if (slug === "process-mapping" && session.outputs["process-mapping"]) {
    const o = session.outputs["process-mapping"];
    getProcessMapStore().setState({
      companyName: o.companyName || session.companyName,
      industryId: o.industryId || session.industryId,
      functionId: o.functionId || session.functionId,
      workflowId: o.workflowId,
      inputMode: o.inputMode ?? "pipeline",
      pipelinePayload: o.pipelinePayload ?? "",
      pastedNotes: o.pastedNotes ?? "",
      customNotes: o.customNotes ?? "",
      document: o.document,
      error: null,
      isGenerating: false,
      isRefining: false,
    });
    return Boolean(o.document);
  }

  if (slug === "improvement-initiatives" && session.outputs["improvement-initiatives"]) {
    const o = session.outputs["improvement-initiatives"];
    getInitiativeStore().setState({
      companyName: o.companyName || session.companyName,
      industryId: o.industryId || session.industryId,
      functionId: o.functionId || session.functionId,
      workflowId: o.workflowId,
      inputMode: o.inputMode ?? "pipeline",
      processMapText: o.processMapText ?? "",
      customNotes: o.customNotes ?? "",
      pipelinePayload: o.pipelinePayload ?? "",
      processSteps: o.processSteps ?? [],
      painPoints: o.painPoints ?? [],
      inventory: o.document,
      error: null,
      isGenerating: false,
    });
    return Boolean(o.document);
  }

  return false;
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
      linkedGuideUpdatedAt: scoping.guide.updatedAt,
      guideSource: "scoping",
      inputMode: "pipeline",
    });
  } else {
    getInterviewStore().setState({
      guidePayload: "",
      guideQuestions: [],
      linkedGuideId: null,
      linkedGuideUpdatedAt: null,
      guideSource: null,
    });
  }
}

export function applyScopingGuide(
  guide: InterviewGuide,
  ctx: {
    companyName: string;
    industryId: string;
    functionId: string;
    workflowId: string;
    roleId: string;
    customNotes: string;
  },
) {
  applyScopingToInterview({
    savedAt: new Date().toISOString(),
    ...ctx,
    level: "deep_dive",
    guide,
  });
}

export function applyInterviewToProcessMap(
  output: NonNullable<AgentSessionOutputs["live-interview"]>,
) {
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
        evidenceSnippet:
          output.document!.evidenceRegistry.find((e) => p.evidenceIds.includes(e.id))?.quote ??
          p.description,
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

export function applyProcessMapToInitiatives(
  output: NonNullable<AgentSessionOutputs["process-mapping"]>,
) {
  const { toPipelineHandoff } = getProcessMapLogic();
  const store = getInitiativeStore().getState();
  store.setWorkflowId(output.workflowId);
  if (output.document) {
    const handoff = toPipelineHandoff(output.document);
    store.setPipelinePayload(JSON.stringify(handoff, null, 2));
    store.setProcessSteps(handoff.processSteps ?? []);
    store.setPainPoints(handoff.painPoints ?? []);
    store.setInputMode("pipeline");
  } else if (output.pipelinePayload) {
    store.setPipelinePayload(output.pipelinePayload);
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
      store.setPastedNotes(formatGuideSectionsForNotes(scoping.guide));
      store.setInputMode("standalone");
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
