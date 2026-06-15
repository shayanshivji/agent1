"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { BSN_PRESET } from "@/data/engagement-context";
import { INITIATIVE_DEFAULTS, getPipelineValidation } from "@/lib/initiatives/logic";
import {
  buildInventoryFromResponse,
  useInitiativeStore,
} from "@/store/initiative-store";
import { InitiativeConfigPanel } from "@/components/initiatives/InitiativeConfigPanel";
import { InitiativeContextPanel } from "@/components/initiatives/InitiativeContextPanel";
import { InitiativeSourcesPanel } from "@/components/initiatives/InitiativeSourcesPanel";
import { InitiativeList } from "@/components/initiatives/InitiativeList";
import { InitiativeSidePanel } from "@/components/initiatives/InitiativeSidePanel";
import { WorkspaceToolbar } from "@/components/workspace/WorkspaceToolbar";
import { UpstreamHandoffBar } from "@/components/workspace/UpstreamHandoffBar";
import {
  DEFAULT_WORKSPACE_STAGES,
  WorkspaceStageStepper,
} from "@/components/workspace/WorkspaceStageStepper";
import { StageFooter } from "@/components/workspace/StageFooter";
import { flushProjectSave } from "@/store/project-store";

interface InitiativesAgentWorkspaceProps {
  embedded?: boolean;
}

export function InitiativesAgentWorkspace({ embedded }: InitiativesAgentWorkspaceProps = {}) {
  const {
    companyName,
    industryId,
    functionId,
    workflowId,
    inputMode,
    viewFilter,
    customNotes,
    pipelinePayload,
    processMapText,
    sources,
    inventory,
    isGenerating,
    error,
    lastGenerationMode,
    setGenerating,
    setError,
    setInventory,
    setProcessSteps,
    setPainPoints,
    setLastGenerationMode,
    getContext,
    reset,
  } = useInitiativeStore();

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
    if (!embedded) return;
    return () => flushProjectSave();
  }, [embedded]);

  useEffect(() => {
    if (!hydrated) {
      if (inventory) {
        setStage(3);
        setMaxStage(3);
      }
      setHydrated(true);
    }
  }, [inventory, hydrated]);

  useEffect(() => {
    if (hydrated && !inventory && stage === 3) {
      setStage(2);
      setMaxStage((m) => Math.min(m, 2));
    }
  }, [inventory, hydrated, stage]);

  function handleSessionRestored(hasOutput: boolean) {
    if (hasOutput) {
      setStage(3);
      setMaxStage(3);
    } else {
      setStage(1);
      setMaxStage(1);
    }
  }

  function handleUpstreamApplied() {
    setStage(2);
    setMaxStage(2);
  }

  const hasWork =
    Boolean(inventory) ||
    sources.length > 0 ||
    customNotes.trim().length > 0 ||
    pipelinePayload.trim().length > 0 ||
    processMapText.trim().length > 0 ||
    companyName !== BSN_PRESET.companyName ||
    workflowId !== INITIATIVE_DEFAULTS.workflowId;

  async function handleGenerate() {
    if (inputMode === "pipeline" && pipelinePayload.trim()) {
      const validation = getPipelineValidation(pipelinePayload, workflowId);
      if (!validation.valid) {
        setError(validation.error ?? "Invalid pipeline JSON");
        return;
      }
    }

    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-initiatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          industryId,
          functionId,
          workflowId,
          inputMode,
          viewFilter,
          customNotes: customNotes || undefined,
          pipelinePayload,
          processMapText,
          sources: sources.map((s) => ({
            name: s.name,
            extractedText: s.extractedText,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      setProcessSteps(data.processSteps);
      setPainPoints(data.painPoints);
      setLastGenerationMode(data.mode ?? "template");

      const inv = buildInventoryFromResponse(
        workflowId,
        getContext(),
        inputMode,
        viewFilter,
        {
          processSteps: data.processSteps,
          painPoints: data.painPoints,
          initiatives: data.initiatives,
          mappings: data.mappings,
        },
        customNotes || undefined,
        data.mode,
      );
      setInventory(inv);
      setStage(3);
      setMaxStage(3);
      if (embedded) flushProjectSave();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  function handleClear() {
    if (!window.confirm("Clear all configuration, sources, and generated initiatives?")) {
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
        agentSlug="improvement-initiatives"
        backSlug="improvement-initiatives"
        backLabel="Initiatives Agent"
        title="Improvement Initiatives Agent"
        subtitle="Process-driven initiatives mapped to pain points"
        onClear={handleClear}
        isGenerating={isGenerating}
        hasWork={hasWork}
        llmEnabled={llmEnabled}
        lastMode={lastGenerationMode && inventory ? lastGenerationMode : null}
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
        <UpstreamHandoffBar agentSlug="improvement-initiatives" onApplied={handleUpstreamApplied} />

        {stage === 1 && (
          <div className="workspace-stage-panel">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[var(--text)]">Configure run</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Choose input mode, workflow, and how you want to view initiatives.
              </p>
            </div>
            <InitiativeConfigPanel staged />
            <StageFooter stage={1} onContinue={() => goToStep(2)} continueLabel="Continue to sources" />
          </div>
        )}

        {stage === 2 && (
          <div className="workspace-stage-panel">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[var(--text)]">Add context & sources</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Upload documents, paste pipeline JSON, or add process notes before generating.
              </p>
            </div>
            <div className="space-y-4">
              <InitiativeSourcesPanel />
              <InitiativeContextPanel />
            </div>
            {isGenerating ? (
              <div className="section-card p-12 flex flex-col items-center gap-4 mt-6">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                <p className="text-sm text-[var(--text-muted)]">
                  Mapping pain points to initiatives…
                </p>
              </div>
            ) : (
              <StageFooter
                stage={2}
                isGenerating={isGenerating}
                onBack={() => goToStep(1)}
                onGenerate={handleGenerate}
                generateLabel="Generate initiatives"
                showSkip
                onSkip={handleGenerate}
                skipLabel="Generate without extra sources"
              />
            )}
          </div>
        )}

        {stage === 3 && (
          <div>
            {isGenerating ? (
              <div className="section-card p-12 flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                <p className="text-sm text-[var(--text-muted)]">
                  Mapping pain points to initiatives…
                </p>
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <section className="lg:col-span-8">
                    <InitiativeList />
                  </section>
                  <aside className="lg:col-span-4 lg:sticky lg:top-6 lg:self-start">
                    <InitiativeSidePanel />
                  </aside>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </>
  );
}
