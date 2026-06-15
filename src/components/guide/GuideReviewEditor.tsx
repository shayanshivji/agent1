"use client";

import { Plus, Trash2 } from "lucide-react";
import { useGuideStore } from "@/store/guide-store";
import type { GuideSectionId, InterviewSection } from "@/types/guide";
import {
  confidenceClass,
  confidenceLabel,
  isNarrativeSection,
  isQuestionSection,
  lowConfidenceSections,
  sectionConfidence,
} from "@/lib/guide/section-utils";
import { GuideFeedbackChat } from "@/components/guide/GuideFeedbackChat";

interface GuideReviewEditorProps {
  llmEnabled?: boolean | null;
}

function NarrativeBlock({
  section,
  onChange,
  confidence,
}: {
  section: InterviewSection;
  onChange: (content: string) => void;
  confidence: ReturnType<typeof sectionConfidence>;
}) {
  const items = section.bullets ?? [];

  return (
    <div className="guide-section-block">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)]">{section.title}</h3>
          {section.id === "objective" && (
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              What this interview must establish — edit the narrative below
            </p>
          )}
        </div>
        <span className={`guide-confidence-badge ${confidenceClass(confidence)}`}>
          {confidenceLabel(confidence)}
        </span>
      </div>
      <textarea
        value={section.content}
        onChange={(e) => onChange(e.target.value)}
        rows={section.id === "objective" ? 3 : 4}
        className="field-input resize-y text-sm"
        placeholder="Narrative context for this section…"
      />
      {items.length > 0 && section.id !== "objective" && (
        <ul className="mt-3 space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="text-xs text-[var(--text-muted)] flex gap-2">
              <span className="text-[var(--accent)] shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function QuestionBlock({
  section,
  confidence,
  onUpdateQuestion,
  onAddQuestion,
  onRemoveQuestion,
  onUpdateIntro,
}: {
  section: InterviewSection;
  confidence: ReturnType<typeof sectionConfidence>;
  onUpdateQuestion: (index: number, text: string) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number) => void;
  onUpdateIntro: (content: string) => void;
}) {
  const questions = section.bullets ?? [];

  return (
    <div className="guide-section-block">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)]">{section.title}</h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
            {questions.length} question{questions.length === 1 ? "" : "s"} — edit inline
          </p>
        </div>
        <span className={`guide-confidence-badge ${confidenceClass(confidence)}`}>
          {confidenceLabel(confidence)}
        </span>
      </div>

      {section.content?.trim() && (
        <textarea
          value={section.content}
          onChange={(e) => onUpdateIntro(e.target.value)}
          rows={2}
          className="field-input resize-y text-xs mb-3 text-[var(--text-muted)]"
          placeholder="Optional framing note for this block…"
        />
      )}

      <div className="space-y-2">
        {questions.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic py-2">
            No questions generated yet — add one below or ask the agent to revise.
          </p>
        ) : (
          questions.map((q, i) => (
            <div key={i} className="guide-question-row flex gap-2 items-start">
              <span className="guide-question-num">{i + 1}</span>
              <textarea
                value={q}
                onChange={(e) => onUpdateQuestion(i, e.target.value)}
                rows={2}
                className="field-input resize-y text-sm flex-1"
                placeholder="Interview question…"
              />
              <button
                type="button"
                onClick={() => onRemoveQuestion(i)}
                className="p-1.5 text-[var(--text-muted)] hover:text-red-400 shrink-0"
                aria-label="Remove question"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      <button type="button" onClick={onAddQuestion} className="btn-secondary text-xs mt-3">
        <Plus className="h-3.5 w-3.5" />
        Add question
      </button>
    </div>
  );
}

export function GuideReviewEditor({ llmEnabled }: GuideReviewEditorProps) {
  const {
    guide,
    sources,
    updateSection,
    updateQuestion,
    addQuestion,
    removeQuestion,
    setReviewStatus,
  } = useGuideStore();

  if (!guide) {
    return (
      <div className="section-card p-12 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          Generate a guide from Step 1 to review and edit questions here.
        </p>
      </div>
    );
  }

  const opts = { llmEnabled: Boolean(llmEnabled), hasSources: sources.length > 0 };
  const gaps = lowConfidenceSections(guide.sections, opts);
  const questionSections = guide.sections.filter((s) => isQuestionSection(s.id));
  const narrativeSections = guide.sections.filter((s) => isNarrativeSection(s.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text)]">{guide.workflowName}</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {guide.roleName} · {guide.level.replace("_", " ")}
          </p>
        </div>
        <select
          value={guide.reviewStatus}
          onChange={(e) =>
            setReviewStatus(e.target.value as "draft" | "in_review" | "validated")
          }
          className="field-input text-sm w-auto"
        >
          <option value="draft">Draft</option>
          <option value="in_review">In review</option>
          <option value="validated">Validated</option>
        </select>
      </div>

      {gaps.length > 0 && (
        <div className="guide-gaps-banner rounded-md px-4 py-3 text-sm">
          <p className="font-medium text-[var(--text)] mb-1">Sections that need your attention</p>
          <ul className="text-xs text-[var(--text-muted)] space-y-1">
            {gaps.map((s) => (
              <li key={s.id}>• {s.title}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="draft-banner rounded-md px-4 py-3 text-sm">
        <strong>Review before field use.</strong> Edit questions directly or use agent feedback below
        to revise the guide. Sections marked &quot;Needs your input&quot; are thin or missing content.
      </div>

      <section>
        <h3 className="text-xs uppercase tracking-wider text-[var(--accent)] mb-3">
          Background context
        </h3>
        <div className="space-y-4">
          {narrativeSections.map((section) => (
            <NarrativeBlock
              key={section.id}
              section={section}
              confidence={sectionConfidence(section, opts)}
              onChange={(content) =>
                updateSection(section.id, content, section.id === "objective" ? undefined : section.bullets)
              }
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs uppercase tracking-wider text-[var(--accent)] mb-3">
          Interview questions
        </h3>
        <div className="space-y-4">
          {questionSections.map((section) => (
            <QuestionBlock
              key={section.id}
              section={section}
              confidence={sectionConfidence(section, opts)}
              onUpdateQuestion={(i, text) => updateQuestion(section.id as GuideSectionId, i, text)}
              onAddQuestion={() => addQuestion(section.id as GuideSectionId)}
              onRemoveQuestion={(i) => removeQuestion(section.id as GuideSectionId, i)}
              onUpdateIntro={(content) => updateSection(section.id as GuideSectionId, content, section.bullets)}
            />
          ))}
        </div>
      </section>

      <GuideFeedbackChat llmEnabled={llmEnabled} />
    </div>
  );
}
