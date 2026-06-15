import { v4 as uuidv4 } from "uuid";
import type { PainPoint, ProcessStep, UpstreamPipelinePayload } from "@/types/pipeline";
import type {
  ImprovementInitiative,
  InitiativeInventory,
  InitiativeMapping,
  InitiativeViewFilter,
  InputMode,
  LeverType,
} from "@/types/initiative";
import { getSeedForWorkflow } from "@/data/initiative-seeds";
import { getWorkflow } from "@/data/catalog";
import type { EngagementContext } from "@/data/engagement-context";
import { BSN_PRESET } from "@/data/engagement-context";

export function parsePipelinePayload(raw: string): UpstreamPipelinePayload | null {
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw) as UpstreamPipelinePayload;
  } catch {
    return null;
  }
}

export function mergeProcessContext(
  workflowId: string,
  inputMode: InputMode,
  pipelinePayload: string,
  pastedProcessMap?: string,
): { processSteps: ProcessStep[]; painPoints: PainPoint[] } {
  const seed = getSeedForWorkflow(workflowId);
  const parsed = parsePipelinePayload(pipelinePayload);

  if (inputMode === "pipeline" && parsed) {
    const steps = parsed.processSteps?.length ? parsed.processSteps : seed.processSteps;
    const pains = parsed.painPoints?.length ? parsed.painPoints : seed.painPoints;
    return { processSteps: steps, painPoints: pains };
  }

  if (pastedProcessMap?.trim()) {
    return {
      processSteps: seed.processSteps,
      painPoints: [
        ...seed.painPoints,
        {
          id: uuidv4(),
          workflowId,
          processStepIds: seed.processSteps.map((s) => s.id),
          title: "Pain points from pasted process map",
          description: pastedProcessMap.slice(0, 500),
          severity: "medium",
          evidenceSnippet: "User-provided process map",
        },
      ],
    };
  }

  return seed;
}

const LEVER_ROTATION: LeverType[] = [
  "process_fix",
  "ai_automation",
  "tech_data",
  "policy_governance",
  "org_design",
];

export function templateInitiatives(input: {
  workflowId: string;
  workflowName: string;
  processSteps: ProcessStep[];
  painPoints: PainPoint[];
}): {
  initiatives: ImprovementInitiative[];
  mappings: InitiativeMapping[];
} {
  const initiatives: ImprovementInitiative[] = [];
  const mappings: InitiativeMapping[] = [];

  input.painPoints.forEach((pp, i) => {
    const stepId = pp.processStepIds[0] ?? input.processSteps[0]?.id ?? "step-execute";
    const lever = LEVER_ROTATION[i % LEVER_ROTATION.length];
    const horizon = i < 2 ? "H1" : i < 4 ? "H2" : "H3";
    const id = uuidv4();

    const initiative: ImprovementInitiative = {
      id,
      title: `Address: ${pp.title}`,
      description: `Structured initiative to reduce "${pp.title}" at ${input.workflowName} step(s). ${pp.description}`,
      processStepIds: pp.processStepIds.length ? pp.processStepIds : [stepId],
      painPointIds: [pp.id],
      leverType: lever,
      horizon: horizon as "H1" | "H2" | "H3",
      lifecycle: i === 0 ? "in_flight" : "new",
      dependencies: i > 0 ? ["Prioritize intake quality baseline"] : [],
      risks: ["SME adoption", "Peak season capacity constraints"],
      impactDirection: pp.severity === "high" ? "high" : "medium",
      evidenceStrength: pp.evidenceSnippet ? "medium" : "low",
      quickWinType: horizon === "H1" ? "quick_win" : "deeper_redesign",
      sourceReferences: pp.sourceDocument ? [pp.sourceDocument] : ["BSN seed / user context"],
      priorityScore: pp.severity === "high" ? 85 - i * 5 : 70 - i * 5,
      isDuplicate: false,
      order: i,
    };

    initiatives.push(initiative);
    mappings.push({
      initiativeId: id,
      painPointId: pp.id,
      processStepId: stepId,
      rationale: "Directly targets pain point at process step",
    });
  });

  return { initiatives, mappings };
}

export function detectDuplicates(initiatives: ImprovementInitiative[]): ImprovementInitiative[] {
  const seen = new Map<string, string>();
  return initiatives.map((init) => {
    const key = init.title.toLowerCase().slice(0, 40);
    const existing = seen.get(key);
    if (existing) {
      return {
        ...init,
        isDuplicate: true,
        duplicateNote: `Overlaps with another initiative`,
      };
    }
    seen.set(key, init.id);
    return init;
  });
}

export function filterInitiatives(
  initiatives: ImprovementInitiative[],
  filter: InitiativeViewFilter,
): ImprovementInitiative[] {
  let list = [...initiatives];
  switch (filter) {
    case "top_priorities":
      list = list.filter((i) => i.priorityScore >= 75 && !i.isDuplicate);
      break;
    case "ai_automation":
      list = list.filter((i) => i.leverType === "ai_automation");
      break;
    case "process_redesign":
      list = list.filter(
        (i) => i.leverType === "process_fix" || i.leverType === "org_design",
      );
      break;
    case "horizon_h1":
      list = list.filter((i) => i.horizon === "H1");
      break;
    case "horizon_h2":
      list = list.filter((i) => i.horizon === "H2");
      break;
    case "horizon_h3":
      list = list.filter((i) => i.horizon === "H3");
      break;
    default:
      break;
  }
  return list.sort((a, b) => b.priorityScore - a.priorityScore || a.order - b.order);
}

export function buildInventoryFromResponse(
  workflowId: string,
  ctx: EngagementContext,
  inputMode: InputMode,
  viewFilter: InitiativeViewFilter,
  data: {
    processSteps: ProcessStep[];
    painPoints: PainPoint[];
    initiatives: ImprovementInitiative[];
    mappings: InitiativeMapping[];
  },
  customNotes?: string,
  mode?: "llm" | "template",
): InitiativeInventory {
  const workflow = getWorkflow(workflowId, ctx);
  const now = new Date().toISOString();
  const initiatives = detectDuplicates(data.initiatives);

  return {
    id: uuidv4(),
    workflowId,
    workflowName: workflow?.name ?? workflowId,
    companyName: ctx.companyName,
    inputMode,
    processSteps: data.processSteps,
    painPoints: data.painPoints,
    initiatives,
    mappings: data.mappings,
    viewFilter,
    createdAt: now,
    updatedAt: now,
    customNotes,
    generationMode: mode,
  };
}

export const INITIATIVE_DEFAULTS = {
  companyName: BSN_PRESET.companyName,
  industryId: BSN_PRESET.industryId,
  functionId: BSN_PRESET.functionId,
  workflowId: "mts-shop-build",
  inputMode: "standalone" as InputMode,
  viewFilter: "comprehensive" as InitiativeViewFilter,
  customNotes: "",
  pipelinePayload: "",
  processMapText: "",
};
