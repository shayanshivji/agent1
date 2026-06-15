"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Sparkles } from "lucide-react";
import { ConfigPanel } from "@/components/guide/ConfigPanel";
import { GuideEditor } from "@/components/guide/GuideEditor";
import { SourcePanel } from "@/components/guide/SourcePanel";
import { WorkflowStepper } from "@/components/guide/WorkflowStepper";
import { WorkspaceBackLink } from "@/components/layout/WorkspaceBackLink";
import { buildGuideFromResponse, useGuideStore } from "@/store/guide-store";
import { BSN_PRESET } from "@/data/engagement-context";

export function ScopingAgentWorkspace() {
  const {
    companyName,
    industryId,
    functionId,
    workflowId,
    roleId,
    level,
    customNotes,
    sources,
    guide,
    isGenerating,
    error,
    lastGenerationMode,
    setGenerating,
    setError,
    setGuide,
    setLastGenerationMode,
    getContext,
    reset,
  } = useGuideStore();

  const [llmEnabled, setLlmEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setLlmEnabled(d.llmEnabled))
      .catch(() => setLlmEnabled(false));
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          industryId,
          functionId,
          workflowId,
          roleId,
          level,
          customNotes: customNotes || undefined,
          sources,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      setLastGenerationMode(data.mode ?? "template");
      setGuide(
        buildGuideFromResponse(
          workflowId,
          roleId,
          level,
          data.sections,
          getContext(),
          customNotes || undefined,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  const currentStep = guide ? 3 : isGenerating ? 2 : 1;

  const hasWork =
    Boolean(guide) ||
    sources.length > 0 ||
    customNotes.trim().length > 0 ||
    companyName !== BSN_PRESET.companyName ||
    industryId !== BSN_PRESET.industryId ||
    functionId !== BSN_PRESET.functionId ||
    workflowId !== "mts-shop-build" ||
    roleId !== "mts-pod" ||
    level !== "deep_dive";

  function handleClear() {
    if (
      !window.confirm(
        "Clear all configuration, uploaded sources, and the current guide? Saved versions are kept.",
      )
    ) {
      return;
    }
    reset();
    setError(null);
  }

  return (
    <>
      <div className="toolbar-strip">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <WorkspaceBackLink slug="scoping" label="Scoping Agent" />
            <h1 className="text-lg font-semibold text-gradient mt-2">
              Scoping Agent
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Interview guides + fact-base requirements for value sizing
            </p>
          </div>
          <div className="flex items-center gap-3">
            {llmEnabled !== null && (
              <span
                className={
                  llmEnabled ? "badge-mode-llm" : "badge-mode-template"
                }
              >
                {llmEnabled ? "LLM mode" : "Template mode"}
              </span>
            )}
            {lastGenerationMode && guide && (
              <span className="text-xs px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)]">
                Last: {lastGenerationMode}
              </span>
            )}
            <button
              type="button"
              onClick={handleClear}
              disabled={isGenerating || !hasWork}
              className="btn-secondary"
              title="Reset configuration and start over"
            >
              <RotateCcw className="h-4 w-4" />
              Clear & start over
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-primary"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate guide
            </button>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto px-6 pb-3">
          <WorkflowStepper currentStep={currentStep} hasGuide={Boolean(guide)} />
        </div>
      </div>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-6">
        {error && <div className="mb-4 error-banner">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-6 lg:self-start">
            <ConfigPanel
              onGenerate={handleGenerate}
              onClear={handleClear}
              isGenerating={isGenerating}
              hasWork={hasWork}
            />
          </aside>

          <section className="lg:col-span-6">
            {isGenerating ? (
              <div className="section-card p-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                <p className="text-sm text-[var(--text-muted)]">
                  Synthesizing interview guide…
                </p>
                <p className="text-xs text-[var(--text-muted)] text-center max-w-sm">
                  {llmEnabled
                    ? "BSN catalog + McKinsey frameworks + uploaded sources"
                    : "BSN seed template — add OPENAI_API_KEY on Vercel for LLM"}
                </p>
              </div>
            ) : (
              <GuideEditor />
            )}
          </section>

          <aside className="lg:col-span-3 lg:sticky lg:top-6 lg:self-start">
            <SourcePanel />
          </aside>
        </div>
      </main>
    </>
  );
}
