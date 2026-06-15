import { NextResponse } from "next/server";
import { BSN_PRESET } from "@/data/engagement-context";
import { complete, hasLlm } from "@/lib/llm/client";
import { buildSectionRegeneratePrompt } from "@/lib/prompts/interview-guide";
import type { GuideSectionId, InterviewLevel, SourceDocument } from "@/types/guide";

const VALID_LEVELS: InterviewLevel[] = ["intro", "deep_dive", "validation"];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!hasLlm()) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY required for section regeneration" },
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
      "You regenerate one section of a McKinsey BSN Sports interview guide. Return JSON only.",
      buildSectionRegeneratePrompt({
        sectionId: body.sectionId as GuideSectionId,
        sectionTitle: body.sectionTitle,
        workflowId: body.workflowId,
        roleId: body.roleId,
        level,
        customNotes: body.customNotes,
        currentContent: body.currentContent ?? "",
        currentBullets: body.currentBullets,
        sources: (body.sources ?? []) as SourceDocument[],
        engagement,
      }),
      { json: true },
    );

    if (!raw?.trim()) {
      return NextResponse.json({ error: "Empty response from model" }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(raw));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Regeneration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
