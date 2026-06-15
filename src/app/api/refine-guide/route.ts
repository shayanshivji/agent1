import { NextResponse } from "next/server";
import { BSN_PRESET } from "@/data/engagement-context";
import { complete, hasLlm } from "@/lib/llm/client";
import { buildGuideRefinePrompt } from "@/lib/prompts/interview-guide";
import type { GuideSectionId, InterviewLevel, InterviewSection, SourceDocument } from "@/types/guide";

const VALID_LEVELS: InterviewLevel[] = ["intro", "deep_dive", "validation"];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!hasLlm()) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY required for guide refinement" },
        { status: 400 },
      );
    }

    const sections = body.sections as InterviewSection[] | undefined;
    const feedback = (body.feedback as string)?.trim();

    if (!sections?.length || !feedback) {
      return NextResponse.json(
        { error: "Current guide sections and feedback are required" },
        { status: 400 },
      );
    }

    const engagement = {
      companyName: (body.companyName as string)?.trim() || BSN_PRESET.companyName,
      industryId: (body.industryId as string) || BSN_PRESET.industryId,
      functionId: (body.functionId as string) || BSN_PRESET.functionId,
    };
    const level = VALID_LEVELS.includes(body.level) ? body.level : "deep_dive";

    const raw = await complete(
      "You revise McKinsey-style SME interview guides based on consultant feedback. Return JSON only.",
      buildGuideRefinePrompt({
        workflowId: (body.workflowId as string) ?? (body.workflowIds as string[])?.[0],
        workflowIds: (body.workflowIds as string[] | undefined)?.length
          ? (body.workflowIds as string[])
          : body.workflowId
            ? [body.workflowId as string]
            : undefined,
        roleId: body.roleId as string,
        level,
        customNotes: body.customNotes as string | undefined,
        interviewObjective: body.interviewObjective as string | undefined,
        sections,
        feedback,
        sources: (body.sources ?? []) as SourceDocument[],
        engagement,
      }),
      { json: true, temperature: 0.35 },
    );

    if (!raw?.trim()) {
      return NextResponse.json({ error: "Empty response from model" }, { status: 500 });
    }

    const parsed = JSON.parse(raw) as {
      sections: { id: GuideSectionId; title: string; content?: string; bullets?: string[] }[];
    };

    if (!Array.isArray(parsed.sections) || !parsed.sections.length) {
      return NextResponse.json({ error: "Model returned no sections" }, { status: 500 });
    }

    return NextResponse.json({ sections: parsed.sections });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Refinement failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
