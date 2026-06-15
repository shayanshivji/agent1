import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { BSN_PRESET } from "@/data/engagement-context";
import { getRole, getWorkflow } from "@/data/catalog";
import { complete, hasLlm } from "@/lib/llm/client";
import {
  parseGuidePayload,
  templateInterviewDocument,
} from "@/lib/interview-execution/logic";
import {
  INTERVIEW_SYSTEM_PROMPT,
  buildInterviewUserPrompt,
} from "@/lib/prompts/interview-execution";
import type { InputMode } from "@/types/initiative";
import type {
  InterviewExecutionDocument,
  InterviewExecutionMode,
  LiveTurn,
} from "@/types/interview-execution";

function hydrateDocument(
  parsed: Partial<InterviewExecutionDocument>,
  base: InterviewExecutionDocument,
): InterviewExecutionDocument {
  const evidenceRegistry = (parsed.evidenceRegistry ?? []).map((e) => ({
    ...e,
    id: e.id || uuidv4(),
  }));

  const workflowSteps = (parsed.workflowSteps ?? []).map((s, i) => ({
    ...s,
    id: s.id || `step-${i + 1}`,
    evidenceIds: s.evidenceIds ?? [],
    systems: s.systems ?? [],
    sequence: s.sequence ?? i,
        confidence: s.confidence ?? "medium",
  }));

  const painPoints = (parsed.painPoints ?? []).map((p, i) => ({
    ...p,
    id: p.id || `pain-${i + 1}`,
    processStepIds: p.processStepIds ?? [],
    evidenceIds: p.evidenceIds ?? [],
    severity: p.severity ?? "medium",
    confidence: p.confidence ?? "medium",
  }));

  return {
    ...base,
    ...parsed,
    evidenceRegistry,
    workflowSteps,
    painPoints,
    processActivities: (parsed.processActivities ?? []).map((a, i) => ({
      ...a,
      id: a.id || `act-${i + 1}`,
      evidenceIds: a.evidenceIds ?? [],
    })),
    systems: (parsed.systems ?? []).map((s, i) => ({
      ...s,
      id: s.id || `sys-${i + 1}`,
      evidenceIds: s.evidenceIds ?? [],
    })),
    opportunities: (parsed.opportunities ?? []).map((o, i) => ({
      ...o,
      id: o.id || `opp-${i + 1}`,
      evidenceIds: o.evidenceIds ?? [],
      confidence: o.confidence ?? "medium",
    })),
    handoffs: (parsed.handoffs ?? []).map((h, i) => ({
      ...h,
      id: h.id || `ho-${i + 1}`,
      evidenceIds: h.evidenceIds ?? [],
      confidence: h.confidence ?? "medium",
    })),
    openQuestions: (parsed.openQuestions ?? []).map((q, i) => ({
      ...q,
      id: q.id || `oq-${i + 1}`,
      priority: q.priority ?? "medium",
    })),
    contradictions: (parsed.contradictions ?? []).map((c, i) => ({
      ...c,
      id: c.id || `con-${i + 1}`,
    })),
    coverage: parsed.coverage ?? base.coverage,
    liveTurns: parsed.liveTurns ?? base.liveTurns,
    transcriptRaw: parsed.transcriptRaw ?? base.transcriptRaw,
    updatedAt: new Date().toISOString(),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workflowId = body.workflowId as string;
    const roleId = body.roleId as string;
    const mode = (body.mode ?? "transcript") as InterviewExecutionMode;
    const inputMode = (body.inputMode ?? "standalone") as InputMode;
    const companyName = (body.companyName as string) || BSN_PRESET.companyName;
    const ctx = {
      companyName,
      industryId: body.industryId ?? BSN_PRESET.industryId,
      functionId: body.functionId ?? BSN_PRESET.functionId,
    };

    if (!workflowId || !roleId) {
      return NextResponse.json({ error: "Workflow and role are required" }, { status: 400 });
    }

    const workflow = getWorkflow(workflowId, ctx);
    const role = getRole(roleId, ctx);
    const guide = parseGuidePayload(body.guidePayload ?? "");
    const transcriptText = (body.transcriptText ?? "") as string;
    const liveTurns = (body.liveTurns ?? []) as LiveTurn[];
    const stakeholderName = body.stakeholderName as string | undefined;

    if (!hasLlm()) {
      const doc = templateInterviewDocument({
        mode,
        inputMode,
        workflowId,
        workflowName: workflow?.name ?? workflowId,
        roleId,
        roleName: role?.name ?? roleId,
        companyName,
        stakeholderName,
        transcriptText: transcriptText || undefined,
        liveTurns,
        guide,
      });
      return NextResponse.json({ document: doc, mode: "template" });
    }

    const raw = await complete(
      INTERVIEW_SYSTEM_PROMPT,
      buildInterviewUserPrompt({
        mode,
        workflowId,
        workflowName: workflow?.name ?? workflowId,
        roleId,
        roleName: role?.name ?? roleId,
        companyName,
        stakeholderName,
        inputMode,
        customNotes: body.customNotes,
        guideNotes: body.guidePayload,
        transcriptText,
        liveTurns: liveTurns.map((t) => ({ speaker: t.speaker, content: t.content })),
        sources: body.sources ?? [],
      }),
      { json: true, temperature: 0.35 },
    );

    const parsed = JSON.parse(raw) as Partial<InterviewExecutionDocument>;
    const base = templateInterviewDocument({
      mode,
      inputMode,
      workflowId,
      workflowName: workflow?.name ?? workflowId,
      roleId,
      roleName: role?.name ?? roleId,
      companyName,
      stakeholderName,
      transcriptText,
      liveTurns,
      guide,
    });

    const doc = hydrateDocument(parsed, base);
    return NextResponse.json({ document: doc, mode: "llm" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
