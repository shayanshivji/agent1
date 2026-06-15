import { toPipelineHandoff } from "@/lib/process-map/logic";
import { extractQuestionsFromGuide, guideToHandoffPayload } from "@/lib/pipeline/guide-handoff";
import { useGuideStore } from "@/store/guide-store";
import { useInterviewStore } from "@/store/interview-execution-store";
import { useProcessMapStore } from "@/store/process-map-store";
import { useInitiativeStore } from "@/store/initiative-store";
import type {
  AgentSessionOutputs,
  PlatformAgentSlug,
  SavedEngagement,
  ScopingSessionOutput,
} from "@/types/platform-session";

export function captureAgentSnapshot(slug: PlatformAgentSlug): Partial<AgentSessionOutputs> {
  const now = new Date().toISOString();

  if (slug === "scoping") {
    const s = useGuideStore.getState();
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
    const s = useInterviewStore.getState();
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
    const s = useProcessMapStore.getState();
    return {
      "process-mapping": {
        savedAt: now,
        workflowId: s.workflowId,
        guidePayload: s.pipelinePayload,
        document: s.document,
      },
    };
  }

  const s = useInitiativeStore.getState();
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
  const interview = useInterviewStore.getState();
  interview.setCompanyName(scoping.companyName);
  interview.setIndustryId(scoping.industryId);
  interview.setFunctionId(scoping.functionId);
  interview.setWorkflowId(scoping.workflowId);
  interview.setRoleId(scoping.roleId);
  interview.setCustomNotes(scoping.customNotes);

  if (scoping.guide) {
    const questions = extractQuestionsFromGuide(scoping.guide);
    useInterviewStore.setState({
      guidePayload: guideToHandoffPayload(scoping.guide),
      guideQuestions: questions,
      linkedGuideId: scoping.guide.id,
      guideSource: "scoping",
      inputMode: "pipeline",
    });
  }
}

export function applyInterviewToProcessMap(output: NonNullable<AgentSessionOutputs["live-interview"]>) {
  const store = useProcessMapStore.getState();
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
  const store = useInitiativeStore.getState();
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
    const store = useProcessMapStore.getState();
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
  const parts: string[] = [session.companyName];
  if (session.outputs.scoping?.guide) parts.push("Guide");
  if (session.outputs["live-interview"]?.document) parts.push("Interview");
  if (session.outputs["process-mapping"]?.document) parts.push("Process map");
  if (session.outputs["improvement-initiatives"]?.document) parts.push("Initiatives");
  return parts.join(" · ");
}
