import { NextResponse } from "next/server";
import { BSN_PRESET } from "@/data/engagement-context";
import { getWorkflow } from "@/data/catalog";
import { complete, hasLlm } from "@/lib/llm/client";
import {
  mergePipelineIntoMap,
  parsePipelinePayload,
  templateProcessMap,
} from "@/lib/process-map/logic";
import {
  PROCESS_MAP_SYSTEM_PROMPT,
  buildProcessMapUserPrompt,
} from "@/lib/prompts/process-mapping";
import type { InputMode } from "@/types/initiative";
import type { ProcessMapDocument } from "@/types/process-map";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workflowId = body.workflowId as string;
    const inputMode = (body.inputMode ?? "standalone") as InputMode;
    const customNotes = body.customNotes as string | undefined;
    const pipelinePayload = (body.pipelinePayload ?? "") as string;
    const pastedNotes = (body.pastedNotes ?? "") as string;
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

    const workflowName = workflow?.name ?? workflowId;

    if (!hasLlm()) {
      let doc = templateProcessMap({
        workflowId,
        workflowName,
        companyName,
        inputMode,
      });
      const parsed = parsePipelinePayload(pipelinePayload);
      if (inputMode === "pipeline" && parsed) {
        doc = mergePipelineIntoMap(doc, parsed);
      }
      return NextResponse.json({ document: doc, mode: "template" });
    }

    const raw = await complete(
      PROCESS_MAP_SYSTEM_PROMPT,
      buildProcessMapUserPrompt({
        workflowId,
        workflowName,
        companyName,
        inputMode,
        customNotes,
        pipelineNotes: [pipelinePayload, pastedNotes].filter(Boolean).join("\n") || undefined,
        sources,
      }),
      { json: true, temperature: 0.35 },
    );

    const parsed = JSON.parse(raw) as Omit<
      ProcessMapDocument,
      "id" | "workflowId" | "workflowName" | "companyName" | "inputMode" | "createdAt" | "updatedAt" | "refinements"
    >;

    let doc: ProcessMapDocument = {
      ...parsed,
      id: "",
      workflowId,
      workflowName,
      companyName,
      inputMode,
      createdAt: "",
      updatedAt: "",
      refinements: [],
      alternateFlows: parsed.alternateFlows ?? [],
      inFlightInitiatives: parsed.inFlightInitiatives ?? [],
      openQuestions: parsed.openQuestions ?? [],
    };

    const pipeline = parsePipelinePayload(pipelinePayload);
    if (inputMode === "pipeline" && pipeline) {
      doc = mergePipelineIntoMap(doc, pipeline);
    }

    return NextResponse.json({ document: doc, mode: "llm" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
