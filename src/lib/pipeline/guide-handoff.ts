import type { InterviewGuide, GuideSectionId } from "@/types/guide";
import type { GuideQuestionItem } from "@/types/interview-execution";

const QUESTION_SECTIONS: GuideSectionId[] = [
  "primary_questions",
  "follow_up_probes",
  "pain_points_to_test",
  "need_to_confirm",
  "systems_references",
  "evidence_to_capture",
];

const SECTION_LABELS: Partial<Record<GuideSectionId, string>> = {
  primary_questions: "Primary",
  follow_up_probes: "Follow-up",
  pain_points_to_test: "Pain point",
  need_to_confirm: "Confirm",
  systems_references: "Systems",
  evidence_to_capture: "Evidence",
};

export interface ScopingGuideHandoff {
  sourceAgent: "scoping";
  guide: InterviewGuide;
  exportedAt: string;
}

export function guideToHandoffPayload(guide: InterviewGuide): string {
  const payload: ScopingGuideHandoff = {
    sourceAgent: "scoping",
    guide,
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(payload, null, 2);
}

export function extractQuestionsFromGuide(guide: InterviewGuide): GuideQuestionItem[] {
  const items: GuideQuestionItem[] = [];
  let index = 0;

  for (const sectionId of QUESTION_SECTIONS) {
    const section = guide.sections.find((s) => s.id === sectionId);
    if (!section) continue;

    const lines: string[] = [];
    if (section.bullets?.length) {
      lines.push(...section.bullets);
    } else if (section.content?.trim()) {
      lines.push(
        ...section.content
          .split(/\n+/)
          .map((l) => l.replace(/^[-•*]\s*/, "").trim())
          .filter(Boolean),
      );
    }

    for (const text of lines) {
      if (text.length < 8) continue;
      items.push({
        id: `gq-${sectionId}-${index++}`,
        text,
        sectionId,
        sectionLabel: SECTION_LABELS[sectionId] ?? section.title,
        status: "pending",
      });
    }
  }

  return items;
}

export function computeGuideCoverage(questions: GuideQuestionItem[]): number {
  if (!questions.length) return 0;
  const answered = questions.filter((q) => q.status === "answered").length;
  const partial = questions.filter((q) => q.status === "asked").length;
  return Math.min(100, Math.round(((answered + partial * 0.5) / questions.length) * 100));
}

export function syncQuestionStatusFromTurns(
  questions: GuideQuestionItem[],
  turns: { id: string; speaker: string; guideQuestionId?: string }[],
): GuideQuestionItem[] {
  return questions.map((q) => {
    const askedTurn = turns.find((t) => t.guideQuestionId === q.id && t.speaker === "interviewer");
    if (!askedTurn) return { ...q, status: "pending" as const };
    const askedIndex = turns.indexOf(askedTurn);
    const answerTurn = turns.slice(askedIndex + 1).find((t) => t.speaker === "interviewee");
    if (answerTurn) return { ...q, status: "answered" as const };
    return { ...q, status: "asked" as const };
  });
}
