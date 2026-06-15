import { v4 as uuidv4 } from "uuid";
import type { PainPoint, ProcessStep, UpstreamPipelinePayload } from "@/types/pipeline";
import type { InputMode } from "@/types/initiative";
import type {
  InterviewExecutionDocument,
  InterviewExecutionMode,
  InterviewRun,
  LiveTurn,
  GuideQuestionItem,
} from "@/types/interview-execution";
import { getInterviewSeed } from "@/data/interview-seeds";
import { getSeedForWorkflow } from "@/data/initiative-seeds";
import { getRole, getRoleHints, getWorkflow } from "@/data/catalog";
import type { EngagementContext } from "@/data/engagement-context";
import type { InterviewGuide } from "@/types/guide";

export const INTERVIEW_DEFAULTS = {
  workflowId: "nsp-handling",
  roleId: "purchasing",
  mode: "live" as InterviewExecutionMode,
  inputMode: "standalone" as InputMode,
  stakeholderName: "",
  customNotes: "",
  guidePayload: "",
  transcriptText: "",
};

export function parseGuidePayload(raw: string): InterviewGuide | null {
  if (!raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as { guide?: InterviewGuide } & InterviewGuide;
    if (parsed.guide?.sections?.length) return parsed.guide;
    if (parsed.sections?.length) return parsed;
    return null;
  } catch {
    return null;
  }
}

function genericSeed(workflowId: string, roleId: string, roleName: string): ReturnType<typeof getInterviewSeed> {
  const wfSeed = getSeedForWorkflow(workflowId);
  return {
    workflowId,
    roleId,
    executiveSummary: `Structured interview output for ${roleName} on ${workflowId}. Validate with SME before downstream mapping.`,
    processActivities: wfSeed.processSteps.map((s) => ({
      name: s.name,
      description: s.description ?? s.name,
    })),
    workflowSteps: wfSeed.processSteps.map((s, i) => ({
      name: s.name,
      description: s.description ?? s.name,
      sequence: i,
      actorRole: s.ownerRole,
      systems: s.systems ?? [],
      confidence: "low" as const,
    })),
    systems: (wfSeed.processSteps.flatMap((s) => s.systems ?? []).filter(Boolean) as string[])
      .filter((v, i, a) => a.indexOf(v) === i)
      .map((name) => ({ name, usage: `Referenced in ${workflowId} workflow` })),
    painPoints: wfSeed.painPoints.map((p) => ({
      title: p.title,
      description: p.description,
      severity: (p.severity ?? "medium") as "high" | "medium" | "low",
      confidence: "low" as const,
    })),
    opportunities: wfSeed.painPoints.slice(0, 2).map((p) => ({
      title: `Address: ${p.title}`,
      description: `Structured improvement to reduce "${p.title}".`,
      confidence: "low" as const,
    })),
    handoffs: [
      {
        fromRole: "Upstream role",
        toRole: roleName,
        description: "Work routed into this role's queue",
        confidence: "low" as const,
      },
    ],
    openQuestions: [
      { question: "Validate step order and timing with SME", reason: "Catalog seed only", priority: "high" as const },
    ],
    contradictions: [],
    evidence: [
      { quote: "Catalog / seed context; replace with transcript evidence.", source: "Seed", confidence: "low" as const },
    ],
    coverage: {
      score: 45,
      objectivesFromGuide: ["Confirm workflow steps", "Capture pain points", "Map handoffs"],
      topics: [
        { id: "cov-steps", name: "Workflow steps", status: "partial" as const },
        { id: "cov-pain", name: "Pain points", status: "partial" as const },
        { id: "cov-systems", name: "Systems", status: "missing" as const },
      ],
      missingTopics: ["Systems detail", "Exception handling", "Volume / timing metrics"],
      suggestedFollowUps: getRoleHints(workflowId, roleId).slice(0, 3),
    },
  };
}

export function templateInterviewDocument(input: {
  mode: InterviewExecutionMode;
  inputMode: InputMode;
  workflowId: string;
  workflowName: string;
  roleId: string;
  roleName: string;
  companyName?: string;
  stakeholderName?: string;
  transcriptText?: string;
  liveTurns?: LiveTurn[];
  guide?: InterviewGuide | null;
}): InterviewExecutionDocument {
  const rich = getInterviewSeed(input.workflowId, input.roleId)
    ?? genericSeed(input.workflowId, input.roleId, input.roleName);
  if (!rich) throw new Error("No seed");

  const evidenceRegistry = rich.evidence.map((e) => ({ ...e, id: uuidv4() }));
  const workflowSteps = rich.workflowSteps.map((s, i) => ({
    ...s,
    id: `step-${i + 1}`,
    evidenceIds: evidenceRegistry.slice(0, 1).map((e) => e.id),
  }));

  const painPoints = rich.painPoints.map((p, i) => ({
    ...p,
    id: `pain-${i + 1}`,
    processStepIds: workflowSteps[i % workflowSteps.length] ? [workflowSteps[i % workflowSteps.length].id] : [],
    evidenceIds: evidenceRegistry.slice(i, i + 1).map((e) => e.id),
  }));

  const now = new Date().toISOString();
  const objectives = (input.guide?.sections
    .filter((s) => s.id === "objective" || s.id === "primary_questions")
    .flatMap((s) => s.bullets ?? [s.content])
    .filter((x): x is string => Boolean(x)) ?? []).slice(0, 5);

  return {
    id: uuidv4(),
    mode: input.mode,
    inputMode: input.inputMode,
    workflowId: input.workflowId,
    workflowName: input.workflowName,
    roleId: input.roleId,
    roleName: input.roleName,
    stakeholderName: input.stakeholderName,
    companyName: input.companyName,
    executiveSummary: rich.executiveSummary,
    processActivities: rich.processActivities.map((a, i) => ({
      ...a,
      id: `act-${i + 1}`,
      evidenceIds: [],
    })),
    workflowSteps,
    systems: rich.systems.map((s, i) => ({ ...s, id: `sys-${i + 1}`, evidenceIds: [] })),
    painPoints,
    opportunities: rich.opportunities.map((o, i) => ({
      ...o,
      id: `opp-${i + 1}`,
      evidenceIds: [],
    })),
    handoffs: rich.handoffs.map((h, i) => ({
      ...h,
      id: `ho-${i + 1}`,
      evidenceIds: [],
    })),
    openQuestions: rich.openQuestions.map((q, i) => ({ ...q, id: `oq-${i + 1}` })),
    contradictions: rich.contradictions.map((c, i) => ({ ...c, id: `con-${i + 1}` })),
    evidenceRegistry,
    coverage: {
      ...rich.coverage,
      objectivesFromGuide: objectives.length ? objectives : rich.coverage.objectivesFromGuide,
      questionsAsked: input.guide?.sections
        .find((s) => s.id === "primary_questions")
        ?.bullets?.slice(0, 5) ?? [],
    },
    transcriptRaw: input.transcriptText,
    liveTurns: input.liveTurns ?? [],
    reviewStatus: "draft",
    createdAt: now,
    updatedAt: now,
    generationMode: "template",
  };
}

export function toAgent3Package(doc: InterviewExecutionDocument): UpstreamPipelinePayload {
  const processSteps: ProcessStep[] = doc.workflowSteps.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    systems: s.systems,
    ownerRole: s.actorRole ?? doc.roleName,
  }));

  const painPoints: PainPoint[] = doc.painPoints.map((p) => ({
    id: p.id,
    workflowId: doc.workflowId,
    processStepIds: p.processStepIds,
    title: p.title,
    description: p.description,
    severity: p.severity,
    evidenceSnippet: doc.evidenceRegistry
      .filter((e) => p.evidenceIds.includes(e.id))
      .map((e) => e.quote)
      .join(" | ") || undefined,
    sourceDocument: doc.stakeholderName ?? doc.roleName,
  }));

  const handoffSummary = doc.handoffs
    .map((h) => `${h.fromRole} → ${h.toRole}: ${h.description}`)
    .join("\n");

  const interviewNotes = [
    doc.executiveSummary,
    "",
    "## Handoffs",
    handoffSummary,
    "",
    "## Systems",
    doc.systems.map((s) => `- ${s.name}: ${s.usage}`).join("\n"),
    "",
    "## Open questions",
    doc.openQuestions.map((q) => `- ${q.question}`).join("\n"),
  ].join("\n");

  return {
    sourceAgent: "live-interview",
    workflowId: doc.workflowId,
    workflowName: doc.workflowName,
    companyName: doc.companyName,
    processSteps,
    painPoints,
    interviewNotes,
    processMapText: interviewNotes,
    generatedAt: doc.updatedAt,
  };
}

export function buildInterviewFromResponse(
  workflowId: string,
  roleId: string,
  ctx: EngagementContext,
  mode: InterviewExecutionMode,
  inputMode: InputMode,
  data: Omit<
    InterviewExecutionDocument,
    "id" | "workflowId" | "workflowName" | "roleId" | "roleName" | "companyName" | "mode" | "inputMode" | "createdAt" | "updatedAt"
  >,
  genMode?: "llm" | "template",
): InterviewExecutionDocument {
  const workflow = getWorkflow(workflowId, ctx);
  const role = getRole(roleId, ctx);
  const now = new Date().toISOString();
  return {
    ...data,
    id: uuidv4(),
    mode,
    inputMode,
    workflowId,
    workflowName: workflow?.name ?? workflowId,
    roleId,
    roleName: role?.name ?? roleId,
    companyName: ctx.companyName,
    createdAt: now,
    updatedAt: now,
    generationMode: genMode,
    reviewStatus: data.reviewStatus ?? "draft",
    liveTurns: data.liveTurns ?? [],
  };
}

export function suggestFollowUps(
  workflowId: string,
  roleId: string,
  doc: InterviewExecutionDocument | null,
): string[] {
  const hints = getRoleHints(workflowId, roleId);
  const missing = doc?.coverage.missingTopics ?? [];
  const fromMissing = missing.map((t) => `Explore: ${t}`);
  return [...fromMissing, ...hints].slice(0, 6);
}

export function computeCoverageFromTurns(
  turns: LiveTurn[],
  guide: InterviewGuide | null,
): { score: number; questionsAsked: string[] } {
  const questionsAsked = turns
    .filter((t) => t.speaker === "interviewer")
    .map((t) => t.content);
  const guideQuestions =
    guide?.sections.find((s) => s.id === "primary_questions")?.bullets?.length ?? 5;
  const asked = questionsAsked.length;
  const score = guideQuestions > 0 ? Math.min(100, Math.round((asked / guideQuestions) * 100)) : Math.min(100, asked * 15);
  return { score, questionsAsked };
}

export interface InterviewRunFlatState {
  stakeholderName: string;
  roleId: string;
  mode: InterviewExecutionMode;
  transcriptText: string;
  liveTurns: LiveTurn[];
  document: InterviewExecutionDocument | null;
  guideQuestions: GuideQuestionItem[];
}

export function buildInterviewRunFromFlat(
  state: InterviewRunFlatState,
  id: string,
  label: string,
  timestamps?: { createdAt: string; updatedAt: string },
): InterviewRun {
  const now = new Date().toISOString();
  return {
    id,
    label,
    stakeholderName: state.stakeholderName,
    roleId: state.roleId,
    mode: state.mode,
    transcriptText: state.transcriptText,
    liveTurns: state.liveTurns,
    document: state.document,
    guideQuestions: state.guideQuestions,
    createdAt: timestamps?.createdAt ?? now,
    updatedAt: timestamps?.updatedAt ?? now,
  };
}

export function captureFlatFromRun(run: InterviewRun): InterviewRunFlatState {
  return {
    stakeholderName: run.stakeholderName,
    roleId: run.roleId,
    mode: run.mode,
    transcriptText: run.transcriptText,
    liveTurns: run.liveTurns,
    document: run.document,
    guideQuestions: run.guideQuestions,
  };
}

export function runLabelForStakeholder(stakeholderName: string, index: number): string {
  return stakeholderName.trim() || `Interview ${index}`;
}
