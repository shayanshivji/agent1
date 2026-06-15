"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { SectionCard } from "@/components/guide/SectionCard";
import { ExportBar } from "@/components/guide/ExportBar";
import { useGuideStore } from "@/store/guide-store";
import type { GuideSectionId } from "@/types/guide";

export function GuideEditor() {
  const {
    guide,
    workflowId,
    roleId,
    sources,
    updateSection,
    setReviewStatus,
  } = useGuideStore();
  const [regeneratingId, setRegeneratingId] = useState<GuideSectionId | null>(
    null,
  );
  const [regenError, setRegenError] = useState<string | null>(null);

  async function regenerateSection(sectionId: GuideSectionId, title: string) {
    if (!guide) return;
    const section = guide.sections.find((s) => s.id === sectionId);
    if (!section) return;

    setRegeneratingId(sectionId);
    setRegenError(null);

    try {
      const res = await fetch("/api/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId,
          sectionTitle: title,
          workflowId,
          roleId,
          currentContent: section.content,
          sources,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Regeneration failed");
      updateSection(sectionId, data.content ?? "", data.bullets);
    } catch (e) {
      setRegenError(e instanceof Error ? e.message : "Regeneration failed");
    } finally {
      setRegeneratingId(null);
    }
  }

  if (!guide) {
    return (
      <div className="section-card p-12 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-gradient mb-2">
            No guide yet
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Select a workflow and role, optionally upload source materials, then
            click <strong>Generate guide</strong> to create a structured
            interview guide tailored to the SME.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text)]">
            {guide.workflowName}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {guide.roleName} · {guide.level.replace("_", " ")}
          </p>
        </div>
        <select
          value={guide.reviewStatus}
          onChange={(e) =>
            setReviewStatus(
              e.target.value as "draft" | "in_review" | "validated",
            )
          }
          className="field-input text-sm w-auto"
        >
          <option value="draft">Draft</option>
          <option value="in_review">In review</option>
          <option value="validated">Validated</option>
        </select>
      </div>

      <div className="draft-banner rounded-md px-4 py-3 text-sm mb-6">
        <strong>Human review required.</strong> This guide is a draft for
        consultant validation before field use. Edit sections inline and mark
        status when ready.
      </div>

      {regenError && (
        <div className="error-banner flex items-center gap-2 mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {regenError}
        </div>
      )}

      <div className="space-y-3">
        {guide.sections.map((section, i) => (
          <SectionCard
            key={section.id}
            section={section}
            index={i}
            onChange={(content, bullets) =>
              updateSection(section.id, content, bullets)
            }
            onRegenerate={() => regenerateSection(section.id, section.title)}
            regenerating={regeneratingId === section.id}
            defaultOpen={i < 3}
          />
        ))}
      </div>

      <ExportBar />
    </div>
  );
}
