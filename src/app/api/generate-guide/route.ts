import { NextResponse } from "next/server";
import { complete, hasLlm } from "@/lib/llm/client";
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  templateGuide,
} from "@/lib/prompts/interview-guide";
import type { GuideSectionId, InterviewLevel, SourceDocument } from "@/types/guide";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workflowId = body.workflowId as string;
    const roleId = body.roleId as string;
    const level = (body.level ?? "deep_dive") as InterviewLevel;
    const customNotes = body.customNotes as string | undefined;
    const sources = (body.sources ?? []) as SourceDocument[];

    if (!workflowId || !roleId) {
      return NextResponse.json(
        { error: "Workflow and role are required" },
        { status: 400 },
      );
    }

    if (!hasLlm()) {
      const template = templateGuide({ workflowId, roleId, level });
      return NextResponse.json({
        sections: template.sections,
        mode: "template",
      });
    }

    const raw = await complete(
      SYSTEM_PROMPT,
      buildUserPrompt({ workflowId, roleId, level, customNotes, sources }),
      { json: true, temperature: 0.35 },
    );

    const parsed = JSON.parse(raw) as {
      sections: { id: GuideSectionId; title: string; content?: string; bullets?: string[] }[];
    };

    return NextResponse.json({ sections: parsed.sections, mode: "llm" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
