import { NextResponse } from "next/server";
import { BSN_PRESET } from "@/data/engagement-context";
import { getWorkflow } from "@/data/catalog";
import { complete, hasLlm } from "@/lib/llm/client";
import {
  mergeProcessContext,
  templateInitiatives,
} from "@/lib/initiatives/logic";
import {
  INITIATIVE_SYSTEM_PROMPT,
  buildInitiativeUserPrompt,
  normalizeLeverType,
} from "@/lib/prompts/improvement-initiatives";
import type { InitiativeViewFilter, InputMode } from "@/types/initiative";
import type { PainPoint, ProcessStep } from "@/types/pipeline";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workflowId = body.workflowId as string;
    const inputMode = (body.inputMode ?? "standalone") as InputMode;
    const viewFilter = (body.viewFilter ?? "comprehensive") as InitiativeViewFilter;
    const customNotes = body.customNotes as string | undefined;
    const pipelinePayload = (body.pipelinePayload ?? "") as string;
    const processMapText = (body.processMapText ?? "") as string;
    const sources = (body.sources ?? []) as { name: string; extractedText: string }[];
    const companyName = (body.companyName as string) || BSN_PRESET.companyName;

    if (!workflowId) {
      return NextResponse.json({ error: "Workflow is required" }, { status: 400 });
    }

    const workflow = getWorkflow(workflowId, {
      companyName,
      industryId: body.industryId ?? BSN_PRESET.industryId,
      functionId: body.functionId ?? BSN_PRESET.functionId,
    });

    const { processSteps, painPoints } = mergeProcessContext(
      workflowId,
      inputMode,
      pipelinePayload,
      processMapText,
    );

    if (!hasLlm()) {
      const template = templateInitiatives({
        workflowId,
        workflowName: workflow?.name ?? workflowId,
        processSteps,
        painPoints,
      });
      return NextResponse.json({
        processSteps,
        painPoints,
        ...template,
        mode: "template",
      });
    }

    const raw = await complete(
      INITIATIVE_SYSTEM_PROMPT,
      buildInitiativeUserPrompt({
        workflowId,
        workflowName: workflow?.name ?? workflowId,
        companyName,
        inputMode,
        viewFilter,
        customNotes,
        processSteps,
        painPoints,
        sources,
        pipelineNotes: pipelinePayload || processMapText || undefined,
      }),
      { json: true, temperature: 0.35 },
    );

    const parsed = JSON.parse(raw) as {
      initiatives: Record<string, unknown>[];
      mappings: { initiativeId: string; painPointId: string; processStepId: string; rationale: string }[];
    };

    const initiatives = parsed.initiatives.map((item, i) => ({
      id: (item.id as string) || uuidv4(),
      title: String(item.title ?? "Untitled initiative"),
      description: String(item.description ?? ""),
      processStepIds: (item.processStepIds as string[]) ?? [],
      painPointIds: (item.painPointIds as string[]) ?? [],
      leverType: normalizeLeverType(String(item.leverType ?? "process_fix")),
      horizon: (["H1", "H2", "H3"].includes(String(item.horizon)) ? item.horizon : "H2") as "H1" | "H2" | "H3",
      lifecycle: (["new", "partially_existing", "in_flight"].includes(String(item.lifecycle))
        ? item.lifecycle
        : "new") as "new" | "partially_existing" | "in_flight",
      dependencies: (item.dependencies as string[]) ?? [],
      risks: (item.risks as string[]) ?? [],
      impactDirection: (["high", "medium", "low"].includes(String(item.impactDirection))
        ? item.impactDirection
        : "medium") as "high" | "medium" | "low",
      evidenceStrength: (["high", "medium", "low"].includes(String(item.evidenceStrength))
        ? item.evidenceStrength
        : "medium") as "high" | "medium" | "low",
      quickWinType: (item.quickWinType === "quick_win" ? "quick_win" : "deeper_redesign") as "quick_win" | "deeper_redesign",
      sourceReferences: (item.sourceReferences as string[]) ?? [],
      priorityScore: Number(item.priorityScore) || 70 - i,
      isDuplicate: Boolean(item.isDuplicate),
      order: Number(item.order) ?? i,
    }));

    return NextResponse.json({
      processSteps,
      painPoints,
      initiatives,
      mappings: parsed.mappings ?? [],
      mode: "llm",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
