import { v4 as uuidv4 } from "uuid";
import type { PainPoint, ProcessStep, UpstreamPipelinePayload } from "@/types/pipeline";
import type { InputMode } from "@/types/initiative";
import type {
  MapImprovement,
  MapPainPoint,
  MapProcessStep,
  ProcessMapDocument,
} from "@/types/process-map";
import { ACTOR_COLORS } from "@/types/process-map";
import { getProcessMapSeed } from "@/data/process-map-seeds";
import { getSeedForWorkflow } from "@/data/initiative-seeds";
import { getWorkflow } from "@/data/catalog";
import type { EngagementContext } from "@/data/engagement-context";
import { validatePipelinePayload } from "@/lib/pipeline/validate";

export const PROCESS_MAP_DEFAULTS = {
  workflowId: "mts-shop-build",
  inputMode: "standalone" as InputMode,
  customNotes: "",
  pipelinePayload: "",
  pastedNotes: "",
};

export function parsePipelinePayload(raw: string): UpstreamPipelinePayload | null {
  return validatePipelinePayload(raw).parsed;
}

export function getPipelineValidation(raw: string, workflowId?: string) {
  return validatePipelinePayload(raw, { workflowId });
}

function genericFromInitiativeSeed(workflowId: string): ReturnType<typeof getProcessMapSeed> {
  const seed = getSeedForWorkflow(workflowId);
  const actorId = "actor-primary";
  return {
    workflowId,
    purpose: `Current-state workflow for ${workflowId}`,
    phases: [{ id: "phase-main", name: "CORE PROCESS", order: 0 }],
    actors: [{ id: actorId, name: "Primary owner", shortLabel: "Owner", color: ACTOR_COLORS[0] }],
    steps: seed.processSteps.map((s, i) => ({
      id: s.id,
      phaseId: "phase-main",
      name: s.name,
      description: s.description ?? s.name,
      actorId,
      systems: s.systems ?? [],
      confidence: "inferred" as const,
      order: i,
    })),
    painPoints: seed.painPoints.map((p) => ({
      phaseId: "phase-main",
      processStepIds: p.processStepIds,
      title: p.title,
      description: p.description,
      severity: (p.severity ?? "medium") as MapPainPoint["severity"],
      evidenceSnippet: p.evidenceSnippet ?? "Seed / catalog context",
      sourceDocument: p.sourceDocument,
    })),
    improvements: seed.painPoints.slice(0, 3).map((p, i) => ({
      processStepIds: p.processStepIds,
      painPointIds: [],
      title: `Address: ${p.title}`,
      description: `Structured improvement to reduce "${p.title}".`,
      bucket: (["simplify", "automate", "digitize"] as const)[i % 3],
      impactRange: "5-15%",
      priority: p.severity === "high" ? ("high" as const) : ("medium" as const),
    })),
    narrativeSummary: `Consolidated current-state outline for ${workflowId} from catalog seeds and user context.`,
    openQuestions: ["Validate step order and handoffs with SME walkthrough."],
  };
}

export function templateProcessMap(input: {
  workflowId: string;
  workflowName: string;
  companyName?: string;
  inputMode: InputMode;
}): ProcessMapDocument {
  const rich = getProcessMapSeed(input.workflowId) ?? genericFromInitiativeSeed(input.workflowId);
  if (!rich) throw new Error("No seed");

  const painPoints: MapPainPoint[] = rich.painPoints.map((p) => ({
    ...p,
    id: uuidv4(),
  }));

  const painByTitle = new Map(rich.painPoints.map((p, i) => [p.title, painPoints[i].id]));

  const steps: MapProcessStep[] = rich.steps.map((s) => {
    const linkedPains = painPoints
      .filter((p) => p.processStepIds.includes(s.id))
      .map((p) => p.id);
    return {
      ...s,
      painPointIds: linkedPains,
      evidenceRefs: linkedPains.length ? ["BSN seed / interview context"] : [],
    };
  });

  const improvements: MapImprovement[] = rich.improvements.map((imp, i) => {
    const linkedPain = rich.painPoints[i];
    return {
      ...imp,
      id: uuidv4(),
      painPointIds: linkedPain ? [painByTitle.get(linkedPain.title)!].filter(Boolean) : [],
    };
  });

  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    workflowId: input.workflowId,
    workflowName: input.workflowName,
    companyName: input.companyName,
    purpose: rich.purpose,
    narrativeSummary: rich.narrativeSummary,
    phases: rich.phases,
    actors: rich.actors,
    steps,
    painPoints,
    improvements,
    alternateFlows: rich.alternateFlows ?? [],
    inFlightInitiatives: rich.inFlight ?? [],
    openQuestions: rich.openQuestions ?? [],
    inputMode: input.inputMode,
    createdAt: now,
    updatedAt: now,
    generationMode: "template",
    refinements: [],
  };
}

export function mergePipelineIntoMap(
  doc: ProcessMapDocument,
  payload: UpstreamPipelinePayload,
): ProcessMapDocument {
  if (!payload.processSteps?.length && !payload.painPoints?.length) return doc;

  const steps: MapProcessStep[] =
    payload.processSteps?.map((s, i) => ({
      id: s.id,
      phaseId: doc.phases[0]?.id ?? "phase-main",
      name: s.name,
      description: s.description ?? s.name,
      actorId: doc.actors[0]?.id ?? "actor-primary",
      systems: s.systems ?? [],
      painPointIds: [],
      evidenceRefs: ["Upstream pipeline"],
      confidence: "confirmed" as const,
      order: i,
    })) ?? doc.steps;

  const painPoints: MapPainPoint[] =
    payload.painPoints?.map((p) => ({
      id: p.id,
      phaseId: doc.phases.find((ph) => steps.some((s) => s.phaseId === ph.id && p.processStepIds.includes(s.id)))?.id ?? doc.phases[0]?.id ?? "phase-main",
      processStepIds: p.processStepIds,
      title: p.title,
      description: p.description,
      severity: (p.severity === "high" ? "high" : p.severity === "low" ? "low" : "medium") as MapPainPoint["severity"],
      evidenceSnippet: p.evidenceSnippet ?? "Pipeline handoff",
      sourceDocument: p.sourceDocument,
    })) ?? doc.painPoints;

  steps.forEach((s) => {
    s.painPointIds = painPoints.filter((p) => p.processStepIds.includes(s.id)).map((p) => p.id);
  });

  return {
    ...doc,
    steps,
    painPoints,
    updatedAt: new Date().toISOString(),
  };
}

export function toPipelineHandoff(doc: ProcessMapDocument): UpstreamPipelinePayload {
  const processSteps: ProcessStep[] = doc.steps.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    systems: s.systems,
    ownerRole: doc.actors.find((a) => a.id === s.actorId)?.name,
  }));

  const painPoints: PainPoint[] = doc.painPoints.map((p) => ({
    id: p.id,
    workflowId: doc.workflowId,
    processStepIds: p.processStepIds,
    title: p.title,
    description: p.description,
    severity: p.severity === "critical" ? "high" : p.severity,
    evidenceSnippet: p.evidenceSnippet,
    sourceDocument: p.sourceDocument,
  }));

  return {
    sourceAgent: "process-mapping",
    workflowId: doc.workflowId,
    workflowName: doc.workflowName,
    companyName: doc.companyName,
    processSteps,
    painPoints,
    processMapText: doc.narrativeSummary,
    generatedAt: doc.updatedAt,
  };
}

export function buildProcessMapFromResponse(
  workflowId: string,
  ctx: EngagementContext,
  inputMode: InputMode,
  data: Omit<ProcessMapDocument, "id" | "createdAt" | "updatedAt" | "refinements">,
  mode?: "llm" | "template",
): ProcessMapDocument {
  const workflow = getWorkflow(workflowId, ctx);
  const now = new Date().toISOString();
  return {
    ...data,
    id: uuidv4(),
    workflowId,
    workflowName: workflow?.name ?? data.workflowName ?? workflowId,
    companyName: ctx.companyName,
    inputMode,
    createdAt: now,
    updatedAt: now,
    generationMode: mode,
    refinements: [],
  };
}

export function countBySeverity(painPoints: MapPainPoint[]) {
  return {
    critical: painPoints.filter((p) => p.severity === "critical").length,
    high: painPoints.filter((p) => p.severity === "high").length,
    medium: painPoints.filter((p) => p.severity === "medium").length,
    low: painPoints.filter((p) => p.severity === "low").length,
  };
}
