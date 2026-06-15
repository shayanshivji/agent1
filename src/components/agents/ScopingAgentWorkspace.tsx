"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { ConfigPanel } from "@/components/guide/ConfigPanel";
import { GuideContextPanel } from "@/components/guide/GuideContextPanel";
import { GuideReviewEditor } from "@/components/guide/GuideReviewEditor";
import { GuideExportStep } from "@/components/guide/GuideExportStep";
import { SourcePanel } from "@/components/guide/SourcePanel";
import { WorkspaceToolbar } from "@/components/workspace/WorkspaceToolbar";
import {
  SCOPING_WORKSPACE_STAGES,
  WorkspaceStageStepper,
} from "@/components/workspace/WorkspaceStageStepper";
import { StageFooter } from "@/components/workspace/StageFooter";
import { buildGuideFromResponse, useGuideStore } from "@/store/guide-store";
import { BSN_PRESET } from "@/data/engagement-context";
import { flushProjectSave } from "@/store/project-store";
import { contextGaps } from "@/lib/guide/section-utils";

interface ScopingAgentWorkspaceProps {
  embedded?: boolean;
}

export function ScopingAgentWorkspace({ embedded }: ScopingAgentWorkspaceProps = {}) {
  const {
    companyName,
    industryId,
    functionId,
    workflowId,
    workflowIds,
    roleId,
    level,
    customNotes,
    interviewObjective,
    sources,
    guide,
    isGenerating,
    error,
    lastGenerationMode,
    setGenerating,
    setError,
    setGuide,
    setLastGenerationMode,
    setInterviewObjective,
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
        setStage(2);
        setMaxStage(3);
      }
      setHydrated(true);
    }
  }, [guide, hydrated]);

  useEffect(() => {
    if (hydrated && !guide && stage > 1) {
      setStage(1);
      setMaxStage(1);
    }
  }, [guide, hydrated, stage]);

  function handleSessionRestored(hasOutput: boolean) {
    if (hasOutput) {
      setStage(2);
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
    const ids = workflowIds.length ? workflowIds : [workflowId];
    if (!ids.length) {
      setError("Select at least one workflow to scope.");
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
          workflowId: ids[0],
          workflowIds: ids,
          roleId,
          level,
          customNotes: customNotes || undefined,
          interviewObjective: interviewObjective || undefined,
          sources,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      setLastGenerationMode(data.mode ?? "template");
      if (data.notice) setTemplateNotice(data.notice);
      setGuide(
        buildGuideFromResponse(
          ids,
          roleId,
          level,
          data.sections,
          getContext(),
          customNotes || undefined,
          interviewObjective || undefined,
        ),
      );
      setStage(2);
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
    interviewObjective.trim().length > 0 ||
    companyName !== BSN_PRESET.companyName ||
    industryId !== BSN_PRESET.industryId ||
    functionId !== BSN_PRESET.functionId ||
    workflowId !== "mts-shop-build" ||
    workflowIds.length !== 1 ||
    workflowIds[0] !== "mts-shop-build" ||
    roleId !== "mts-pod" ||
    level !== "deep_dive";

  const gaps = contextGaps({
    interviewObjective,
    sourcesCount: sources.length,
    llmEnabled: Boolean(llmEnabled),
  });

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
            steps={SCOPING_WORKSPACE_STAGES}
            currentStep={stage}
            maxReachableStep={maxStage}
            onStepClick={goToStep}
          />
        </div>
      </div>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-6">
        {error && <div className="mb-4 error-banner">{error}</div>}
        {templateNotice && (
          <div className="mb-4 notice-banner rounded-md px-4 py-3 text-xs">
            {templateNotice}
          </div>
        )}

        {stage === 1 && (
          <div className="workspace-stage-panel">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[var(--text)]">
                Step 1 — Context & objective
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
                Give the agent everything you have: engagement context, interview objective, source
                files, and focus notes. It will generate a recommended guide in the next step.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <ConfigPanel hideNotes hideFooter />
                <div className="section-card overflow-hidden">
                  <div className="px-4 py-3 section-card-header">
                    <h2 className="text-sm font-semibold text-[var(--text)]">Interview objective</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      What must this SME session establish?
                    </p>
                  </div>
                  <div className="p-4">
                    <textarea
                      value={interviewObjective}
                      onChange={(e) => setInterviewObjective(e.target.value)}
                      placeholder="e.g. Map the MTS shop-build workflow end-to-end, quantify pain in Engage handoffs, and validate Fall peak volume assumptions…"
                      rows={4}
                      className="field-input resize-y"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {!llmEnabled && (sources.length > 0 || customNotes.trim()) && (
                  <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-xs text-yellow-200">
                    Template mode is active — uploaded sources and custom notes are not sent to the
                    model. Add an OpenAI API key for LLM generation.
                  </div>
                )}
                <SourcePanel />
                <GuideContextPanel />
              </div>
            </div>

            {gaps.length > 0 && (
              <div className="guide-gaps-banner rounded-md px-4 py-3 mt-6 text-sm">
                <p className="font-medium text-[var(--text)] flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-[var(--accent)]" />
                  Before you generate
                </p>
                <ul className="text-xs text-[var(--text-muted)] space-y-1.5">
                  {gaps.map((g) => (
                    <li key={g}>• {g}</li>
                  ))}
                </ul>
              </div>
            )}

            {isGenerating ? (
              <div className="section-card p-12 flex flex-col items-center gap-4 mt-6">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                <p className="text-sm text-[var(--text-muted)]">Generating recommended interview guide…</p>
              </div>
            ) : (
              <StageFooter
                stage={1}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
                generateLabel="Generate interview guide"
                showSkip
                onSkip={handleGenerate}
                skipLabel="Generate with current context"
              />
            )}
          </div>
        )}

        {stage === 2 && (
          <div>
            {isGenerating ? (
              <div className="section-card p-12 flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                <p className="text-sm text-[var(--text-muted)]">Regenerating interview guide…</p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--text)]">
                      Step 2 — Review & edit
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      Edit questions inline or give the agent feedback to revise the guide.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => goToStep(1)} className="btn-secondary text-xs">
                      Edit context
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="btn-secondary text-xs"
                    >
                      Regenerate
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      disabled={!guide}
                      className="btn-primary text-xs"
                    >
                      Continue to export
                    </button>
                  </div>
                </div>
                <GuideReviewEditor llmEnabled={llmEnabled} />
              </>
            )}
          </div>
        )}

        {stage === 3 && (
          <div>
            <div className="mb-6 flex flex-wrap gap-2">
              <button type="button" onClick={() => goToStep(2)} className="btn-secondary text-xs">
                Back to review
              </button>
            </div>
            <GuideExportStep />
          </div>
        )}
      </main>
    </>
  );
}
