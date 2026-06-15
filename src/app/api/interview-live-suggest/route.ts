import { NextResponse } from "next/server";
import { complete, hasLlm } from "@/lib/llm/client";
import { suggestFollowUps } from "@/lib/interview-execution/logic";
import {
  INTERVIEW_SYSTEM_PROMPT,
  buildLiveSuggestPrompt,
} from "@/lib/prompts/interview-execution";
import type { InterviewExecutionDocument } from "@/types/interview-execution";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workflowId = body.workflowId as string;
    const roleId = body.roleId as string;
    const roleName = body.roleName as string;
    const document = body.document as InterviewExecutionDocument | null;
    const recentTurns = (body.recentTurns ?? []) as { speaker: string; content: string }[];
    const guideQuestions = (body.guideQuestions ?? []) as string[];

    const missingTopics = document?.coverage.missingTopics ?? [];
    const coverageScore = document?.coverage.score ?? 0;

    if (!hasLlm()) {
      const followUps = suggestFollowUps(workflowId, roleId, document);
      return NextResponse.json({
        followUps,
        coverageGaps: missingTopics,
        mode: "template",
      });
    }

    const raw = await complete(
      INTERVIEW_SYSTEM_PROMPT,
      buildLiveSuggestPrompt({
        workflowId,
        roleName,
        coverageScore,
        missingTopics,
        recentTurns,
        guideQuestions,
      }),
      { json: true, temperature: 0.4 },
    );

    const parsed = JSON.parse(raw) as { followUps: string[]; coverageGaps?: string[] };
    return NextResponse.json({
      followUps: parsed.followUps ?? [],
      coverageGaps: parsed.coverageGaps ?? missingTopics,
      mode: "llm",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Suggestion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
