"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { ConfigPanel } from "@/components/guide/ConfigPanel";
import { GuideContextPanel } from "@/components/guide/GuideContextPanel";
import { GuideEditor } from "@/components/guide/GuideEditor";
import { SourcePanel } from "@/components/guide/SourcePanel";
import { WorkspaceBackLink } from "@/components/layout/WorkspaceBackLink";
import {
  DEFAULT_WORKSPACE_STAGES,
  WorkspaceStageStepper,
} from "@/components/workspace/WorkspaceStageStepper";
import { StageFooter } from "@/components/workspace/StageFooter";
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

  const [stage, setStage] = useState(1);
  const [maxStage, setMaxStage] = useState(1);
  const [llmEnabled, setLlmEnabled] = useState<boolean | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setLlmEnabled(d.llmEnabled))
      .catch(() => setLlmEnabled(false));
  }, []);

  useEffect(() => {
    if (!hydrated) {
      if (guide) {
        setStage(3);
        setMaxStage(3);
      }
      setHydrated(true);
    }
  }, [guide, hydrated]);

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
      setStage(3);
      setMaxStage(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

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
    setStage(1);
    setMaxStage(1);
  }

  function goToStep(next: number) {
    setStage(next);
    setMaxStage((m) => Math.max(m, next));
  }

  return (
    <>
      <div className="toolbar-strip">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <WorkspaceBackLink slug="scoping" label="Scoping Agent" />
            <h1 className="text-lg font-semibold text-gradient mt-2">Scoping Agent</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Interview guides + fact-base requirements for value sizing
            </p>
          </div>
          <div className="flex items-center gap-3">
            {llmEnabled !== null && (
              <span className={llmEnabled ? "badge-mode-llm" : "badge-mode-template"}>
                {llmEnabled ? "LLM mode" : "Template mode"}
              </span>
            )}
            {lastGenerationMode && guide && stage === 3 && (
              <span className="text-xs px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)]">
                Last: {lastGenerationMode}
              </span>
            )}
            {stage === 3 && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isGenerating || !hasWork}
                className="btn-secondary"
              >
                <RotateCcw className="h-4 w-4" />
                Clear & start over
              </button>
            )}
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto px-6 pb-4">
          <WorkspaceStageStepper
            steps={DEFAULT_WORKSPACE_STAGES}
            currentStep={stage}
            maxReachableStep={maxStage}
            onStepClick={goToStep}
          />
        </div>
      </div>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-6">
        {error && <div className="mb-4 error-banner">{error}</div>}

        {stage === 1 && (
          <div className="workspace-stage-panel">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[var(--text)]">Configure engagement</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Select industry, workflow, role, and interview level.
              </p>
            </div>
            <ConfigPanel hideNotes hideFooter />
            <StageFooter stage={1} onContinue={() => goToStep(2)} continueLabel="Continue to sources" />
          </div>
        )}

        {stage === 2 && (
          <div className="workspace-stage-panel">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[var(--text)]">Add sources</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Upload context files and optional instructions. You can skip if using catalog seeds only.
              </p>
            </div>
            <div className="space-y-4">
              <SourcePanel />
              <GuideContextPanel />
            </div>
            {isGenerating ? (
              <div className="section-card p-12 flex flex-col items-center gap-4 mt-6">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                <p className="text-sm text-[var(--text-muted)]">Synthesizing interview guide…</p>
              </div>
            ) : (
              <StageFooter
                stage={2}
                isGenerating={isGenerating}
                onBack={() => goToStep(1)}
                onGenerate={handleGenerate}
                generateLabel="Generate interview guide"
                showSkip
                onSkip={handleGenerate}
              />
            )}
          </div>
        )}

        {stage === 3 && (
          <div>
            {isGenerating ? (
              <div className="section-card p-12 flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                <p className="text-sm text-[var(--text-muted)]">Synthesizing interview guide…</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button type="button" onClick={() => goToStep(1)} className="btn-secondary text-xs">
                    Edit configuration
                  </button>
                  <button type="button" onClick={() => goToStep(2)} className="btn-secondary text-xs">
                    Edit sources
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="btn-primary text-xs"
                  >
                    Regenerate
                  </button>
                </div>
                <GuideEditor />
              </>
            )}
          </div>
        )}
      </main>
    </>
  );
}
