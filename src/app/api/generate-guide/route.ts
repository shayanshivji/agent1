import { NextResponse } from "next/server";
import { BSN_PRESET } from "@/data/engagement-context";
import { complete, hasLlm } from "@/lib/llm/client";
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  templateGuide,
} from "@/lib/prompts/interview-guide";
import type { GuideSectionId, InterviewLevel, SourceDocument } from "@/types/guide";

const VALID_LEVELS: InterviewLevel[] = ["intro", "deep_dive", "validation"];

function resolveWorkflowIds(body: Record<string, unknown>): string[] {
  const fromArray = body.workflowIds as string[] | undefined;
  if (fromArray?.length) return fromArray;
  const single = body.workflowId as string | undefined;
  return single ? [single] : [];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workflowIds = resolveWorkflowIds(body);
    const workflowId = workflowIds[0] ?? (body.workflowId as string);
    const roleId = body.roleId as string;
    const level = VALID_LEVELS.includes(body.level) ? body.level : "deep_dive";
    const customNotes = body.customNotes as string | undefined;
    const interviewObjective = body.interviewObjective as string | undefined;
    const sources = (body.sources ?? []) as SourceDocument[];
    const engagement = {
      companyName: (body.companyName as string)?.trim() || BSN_PRESET.companyName,
      industryId: (body.industryId as string) || BSN_PRESET.industryId,
      functionId: (body.functionId as string) || BSN_PRESET.functionId,
    };

    if (!workflowIds.length || !roleId) {
      return NextResponse.json(
        { error: "At least one workflow and a role are required" },
        { status: 400 },
      );
    }

    if (!hasLlm()) {
      const template = templateGuide({ workflowId, workflowIds, roleId, level, engagement });
      return NextResponse.json({
        sections: template.sections,
        mode: "template",
        notice:
          sources.length > 0 || customNotes
            ? "Template mode: uploaded sources and custom notes were not used."
            : undefined,
      });
    }

    const raw = await complete(
      SYSTEM_PROMPT,
      buildUserPrompt({
        workflowId,
        workflowIds,
        roleId,
        level,
        customNotes,
        interviewObjective,
        sources,
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
      return NextResponse.json({ error: "Model returned no guide sections" }, { status: 500 });
    }

    return NextResponse.json({ sections: parsed.sections, mode: "llm" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
