import { NextResponse } from "next/server";
import { complete, hasLlm } from "@/lib/llm/client";
import { buildSectionRegeneratePrompt } from "@/lib/prompts/interview-guide";
import type { GuideSectionId, SourceDocument } from "@/types/guide";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!hasLlm()) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY required for section regeneration" },
        { status: 400 },
      );
    }

    const raw = await complete(
      "You regenerate one section of a McKinsey BSN Sports interview guide. Return JSON only.",
      buildSectionRegeneratePrompt({
        sectionId: body.sectionId as GuideSectionId,
        sectionTitle: body.sectionTitle,
        workflowId: body.workflowId,
        roleId: body.roleId,
        currentContent: body.currentContent ?? "",
        sources: (body.sources ?? []) as SourceDocument[],
      }),
      { json: true },
    );

    return NextResponse.json(JSON.parse(raw));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Regeneration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
