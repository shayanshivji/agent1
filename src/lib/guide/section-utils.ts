import type { GuideSectionId, InterviewSection } from "@/types/guide";

/** Sections where bullets are interview questions — shown as editable question rows. */
export const QUESTION_SECTION_IDS: GuideSectionId[] = [
  "need_to_confirm",
  "primary_questions",
  "follow_up_probes",
  "pain_points_to_test",
  "evidence_to_capture",
  "red_flags",
  "closeout",
];

/** Narrative-only sections — no bullet editor exposed in the UI. */
export const NARRATIVE_SECTION_IDS: GuideSectionId[] = [
  "objective",
  "role_snapshot",
  "known_facts",
  "systems_references",
  "fact_base_sizing",
  "likely_outputs",
  "dependencies_handoffs",
];

export type SectionConfidence = "high" | "medium" | "low";

export function isQuestionSection(id: GuideSectionId): boolean {
  return QUESTION_SECTION_IDS.includes(id);
}

export function isNarrativeSection(id: GuideSectionId): boolean {
  return NARRATIVE_SECTION_IDS.includes(id);
}

export function sectionConfidence(
  section: InterviewSection,
  opts: { llmEnabled: boolean; hasSources: boolean },
): SectionConfidence {
  const bullets = section.bullets ?? [];
  const hasContent = Boolean(section.content?.trim());
  const hasQuestions = bullets.length >= 3;

  if (isQuestionSection(section.id)) {
    if (bullets.length === 0) return "low";
    if (bullets.length < 3) return "medium";
    if (!opts.llmEnabled && !opts.hasSources) return "medium";
    return "high";
  }

  if (!hasContent && bullets.length === 0) return "low";
  if (hasContent || bullets.length > 0) {
    if (!opts.llmEnabled && !opts.hasSources) return "medium";
    return "high";
  }
  return "medium";
}

export function confidenceLabel(c: SectionConfidence): string {
  if (c === "high") return "Ready to review";
  if (c === "medium") return "Worth a quick check";
  return "Needs your input";
}

export function confidenceClass(c: SectionConfidence): string {
  if (c === "high") return "guide-confidence-high";
  if (c === "medium") return "guide-confidence-medium";
  return "guide-confidence-low";
}

export function lowConfidenceSections(
  sections: InterviewSection[],
  opts: { llmEnabled: boolean; hasSources: boolean },
): InterviewSection[] {
  return sections.filter((s) => sectionConfidence(s, opts) === "low");
}

export function contextGaps(input: {
  interviewObjective: string;
  sourcesCount: number;
  llmEnabled: boolean;
}): string[] {
  const gaps: string[] = [];
  if (!input.interviewObjective.trim()) {
    gaps.push("Interview objective is empty — tell the agent what this session must accomplish.");
  }
  if (input.sourcesCount === 0) {
    gaps.push("No source documents uploaded — the guide will rely on catalog templates.");
  }
  if (!input.llmEnabled) {
    gaps.push("Template mode is active — upload an OpenAI API key for LLM-generated, context-aware guides.");
  }
  return gaps;
}
