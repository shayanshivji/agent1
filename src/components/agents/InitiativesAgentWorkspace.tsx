"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Sparkles } from "lucide-react";
import { BSN_PRESET } from "@/data/engagement-context";
import { INITIATIVE_DEFAULTS } from "@/lib/initiatives/logic";
import {
  buildInventoryFromResponse,
  useInitiativeStore,
} from "@/store/initiative-store";
import { InitiativeConfigPanel } from "@/components/initiatives/InitiativeConfigPanel";
import { InitiativeList } from "@/components/initiatives/InitiativeList";
import { InitiativeSidePanel } from "@/components/initiatives/InitiativeSidePanel";

export function InitiativesAgentWorkspace() {
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

  const [llmEnabled, setLlmEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setLlmEnabled(d.llmEnabled))
      .catch(() => setLlmEnabled(false));
  }, []);

  const hasWork =
    Boolean(inventory) ||
    sources.length > 0 ||
    customNotes.trim().length > 0 ||
    pipelinePayload.trim().length > 0 ||
    processMapText.trim().length > 0 ||
    companyName !== BSN_PRESET.companyName ||
    workflowId !== INITIATIVE_DEFAULTS.workflowId;

  async function handleGenerate() {
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  function handleClear() {
    if (
      !window.confirm(
        "Clear all configuration, sources, and generated initiatives?",
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
            <h1 className="text-lg font-semibold text-gradient">
              Improvement Initiatives Agent
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Process-driven initiatives mapped to pain points · standalone or pipeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            {llmEnabled !== null && (
              <span className={llmEnabled ? "badge-mode-llm" : "badge-mode-template"}>
                {llmEnabled ? "LLM mode" : "Template mode"}
              </span>
            )}
            {lastGenerationMode && inventory && (
              <span className="text-xs px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)]">
                Last: {lastGenerationMode}
              </span>
            )}
            <button
              type="button"
              onClick={handleClear}
              disabled={isGenerating || !hasWork}
              className="btn-secondary"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
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
              Generate
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-6">
        {error && <div className="mb-4 error-banner">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 lg:sticky lg:top-6 lg:self-start">
            <InitiativeConfigPanel
              onGenerate={handleGenerate}
              onClear={handleClear}
              isGenerating={isGenerating}
              hasWork={hasWork}
            />
          </aside>

          <section className="lg:col-span-6">
            {isGenerating ? (
              <div className="section-card p-12 flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                <p className="text-sm text-[var(--text-muted)]">
                  Mapping pain points to initiatives…
                </p>
              </div>
            ) : (
              <InitiativeList />
            )}
          </section>

          <aside className="lg:col-span-3 lg:sticky lg:top-6 lg:self-start">
            <InitiativeSidePanel />
          </aside>
        </div>
      </main>
    </>
  );
}
