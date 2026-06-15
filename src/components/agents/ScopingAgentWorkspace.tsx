"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ConfigPanel } from "@/components/guide/ConfigPanel";
import { GuideContextPanel } from "@/components/guide/GuideContextPanel";
import { GuideEditor } from "@/components/guide/GuideEditor";
import { SourcePanel } from "@/components/guide/SourcePanel";
import { WorkspaceToolbar } from "@/components/workspace/WorkspaceToolbar";
import {
  DEFAULT_WORKSPACE_STAGES,
  WorkspaceStageStepper,
} from "@/components/workspace/WorkspaceStageStepper";
import { StageFooter } from "@/components/workspace/StageFooter";
import { buildGuideFromResponse, useGuideStore } from "@/store/guide-store";
import { BSN_PRESET } from "@/data/engagement-context";
import { flushProjectSave } from "@/store/project-store";

interface ScopingAgentWorkspaceProps {
  embedded?: boolean;
}

export function ScopingAgentWorkspace({ embedded }: ScopingAgentWorkspaceProps = {}) {
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
  const [templateNotice, setTemplateNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setLlmEnabled(d.llmEnabled))
      .catch(() => setLlmEnabled(false));
  }, []);

  useEffect(() => {
    if (!embedded) return;
    return () => flushProjectSave();
  }, [embedded]);

  useEffect(() => {
    if (!hydrated) {
      if (guide) {
        setStage(3);
        setMaxStage(3);
      }
      setHydrated(true);
    }
  }, [guide, hydrated]);

  useEffect(() => {
    if (hydrated && !guide && stage === 3) {
      setStage(2);
      setMaxStage((m) => Math.min(m, 2));
    }
  }, [guide, hydrated, stage]);

  function handleSessionRestored(hasOutput: boolean) {
    if (hasOutput) {
      setStage(3);
      setMaxStage(3);
    } else {
      setStage(1);
      setMaxStage(1);
    }
  }

  async function handleGenerate() {
    if (!companyName.trim()) {
      setError("Enter a company / client name before generating.");
      return;
    }

    setGenerating(true);
    setError(null);
    setTemplateNotice(null);

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
      if (data.notice) setTemplateNotice(data.notice);
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
      if (embedded) flushProjectSave();
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
      <WorkspaceToolbar
        agentSlug="scoping"
        backSlug="scoping"
        backLabel="Scoping Agent"
        title="Scoping Agent"
        subtitle="Interview guides + fact-base requirements for value sizing"
        onClear={handleClear}
        isGenerating={isGenerating}
        hasWork={hasWork}
        llmEnabled={llmEnabled}
        lastMode={lastGenerationMode && guide ? lastGenerationMode : null}
        onSessionRestored={handleSessionRestored}
        embedded={embedded}
      />
      <div className="toolbar-strip border-t-0 pt-0">
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
        {templateNotice && (
          <div className="mb-4 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-xs text-yellow-200">
            {templateNotice}
          </div>
        )}

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
              {!llmEnabled && (sources.length > 0 || customNotes.trim()) && (
                <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-xs text-yellow-200">
                  Template mode is active — uploaded sources and custom notes are not sent to the model.
                  Add an OpenAI API key for LLM generation, or continue with catalog-based templates.
                </div>
              )}
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
                skipLabel="Generate without sources"
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
                <GuideEditor llmEnabled={llmEnabled} />
              </>
            )}
          </div>
        )}
      </main>
    </>
  );
}
