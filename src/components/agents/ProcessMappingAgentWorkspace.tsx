"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { BSN_PRESET } from "@/data/engagement-context";
import { PROCESS_MAP_DEFAULTS } from "@/lib/process-map/logic";
import { useProcessMapStore } from "@/store/process-map-store";
import { ProcessMapConfigPanel } from "@/components/process-map/ProcessMapConfigPanel";
import { ProcessMapContextPanel } from "@/components/process-map/ProcessMapContextPanel";
import { ProcessMapSourcesPanel } from "@/components/process-map/ProcessMapSourcesPanel";
import { ProcessMapTabs } from "@/components/process-map/ProcessMapTabs";
import { ProcessMapSummaryView } from "@/components/process-map/ProcessMapSummaryView";
import { ProcessMapCanvas } from "@/components/process-map/ProcessMapCanvas";
import { ProcessMapPainView } from "@/components/process-map/ProcessMapPainView";
import { ProcessMapImprovementsView } from "@/components/process-map/ProcessMapImprovementsView";
import { ProcessStepDetailPanel } from "@/components/process-map/ProcessStepDetailPanel";
import { ProcessMapExportBar } from "@/components/process-map/ProcessMapExportBar";
import { RefineModal } from "@/components/process-map/RefineModal";
import { WorkspaceToolbar } from "@/components/workspace/WorkspaceToolbar";
import { UpstreamHandoffBar } from "@/components/workspace/UpstreamHandoffBar";
import {
  DEFAULT_WORKSPACE_STAGES,
  WorkspaceStageStepper,
} from "@/components/workspace/WorkspaceStageStepper";
import { StageFooter } from "@/components/workspace/StageFooter";

export function ProcessMappingAgentWorkspace() {
  const {
    companyName,
    industryId,
    functionId,
    workflowId,
    inputMode,
    customNotes,
    pipelinePayload,
    pastedNotes,
    sources,
    document,
    activeTab,
    isGenerating,
    error,
    lastGenerationMode,
    setGenerating,
    setError,
    setDocument,
    setLastGenerationMode,
    reset,
  } = useProcessMapStore();

  const [stage, setStage] = useState(1);
  const [maxStage, setMaxStage] = useState(1);
  const [llmEnabled, setLlmEnabled] = useState<boolean | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setLlmEnabled(d.llmEnabled))
      .catch(() => setLlmEnabled(false));
  }, []);

  useEffect(() => {
    if (!hydrated) {
      if (document) {
        setStage(3);
        setMaxStage(3);
      }
      setHydrated(true);
    }
  }, [document, hydrated]);

  const hasWork =
    Boolean(document) ||
    sources.length > 0 ||
    customNotes.trim().length > 0 ||
    pipelinePayload.trim().length > 0 ||
    pastedNotes.trim().length > 0 ||
    companyName !== BSN_PRESET.companyName ||
    workflowId !== PROCESS_MAP_DEFAULTS.workflowId;

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-process-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          industryId,
          functionId,
          workflowId,
          inputMode,
          customNotes: customNotes || undefined,
          pipelinePayload,
          pastedNotes,
          sources: sources.map((s) => ({
            name: s.name,
            extractedText: s.extractedText,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      const doc = data.document;
      if (!doc.id) doc.id = crypto.randomUUID?.() ?? String(Date.now());
      const now = new Date().toISOString();
      if (!doc.createdAt) doc.createdAt = now;
      doc.updatedAt = now;
      doc.refinements = doc.refinements ?? [];

      setDocument(doc);
      setLastGenerationMode(data.mode ?? "template");
      setStage(3);
      setMaxStage(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  function handleClear() {
    if (!window.confirm("Clear all configuration, sources, and generated process map?")) {
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
        agentSlug="process-mapping"
        backSlug="process-mapping"
        backLabel="Process Mapping Agent"
        title="Current-State Process Mapping Agent"
        subtitle="ProcessAI-style maps from interview evidence, transcripts, and pipeline inputs"
        onClear={handleClear}
        isGenerating={isGenerating}
        hasWork={hasWork}
        llmEnabled={llmEnabled}
        lastMode={lastGenerationMode && document ? lastGenerationMode : null}
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
        <UpstreamHandoffBar agentSlug="process-mapping" />

        {stage === 1 && (
          <div className="workspace-stage-panel">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[var(--text)]">Configure run</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Choose input mode and the workflow to map.
              </p>
            </div>
            <ProcessMapConfigPanel staged />
            <StageFooter stage={1} onContinue={() => goToStep(2)} continueLabel="Continue to sources" />
          </div>
        )}

        {stage === 2 && (
          <div className="workspace-stage-panel">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[var(--text)]">Add context & sources</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Upload interview notes, paste transcripts, or add pipeline JSON before generating.
              </p>
            </div>
            <div className="space-y-4">
              <ProcessMapSourcesPanel />
              <ProcessMapContextPanel />
            </div>
            {isGenerating ? (
              <div className="section-card p-12 flex flex-col items-center gap-4 mt-6">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                <p className="text-sm text-[var(--text-muted)]">
                  Building current-state process map…
                </p>
              </div>
            ) : (
              <StageFooter
                stage={2}
                isGenerating={isGenerating}
                onBack={() => goToStep(1)}
                onGenerate={handleGenerate}
                generateLabel="Generate process map"
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
                <p className="text-sm text-[var(--text-muted)]">
                  Building current-state process map…
                </p>
              </div>
            ) : document ? (
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

                <ProcessMapExportBar />
                <ProcessMapTabs onRefine={() => setRefineOpen(true)} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
                  <section className="lg:col-span-8">
                    {activeTab === "summary" && <ProcessMapSummaryView />}
                    {activeTab === "process" && <ProcessMapCanvas />}
                    {activeTab === "pain" && <ProcessMapPainView />}
                    {activeTab === "improvements" && <ProcessMapImprovementsView />}
                  </section>
                  <aside className="lg:col-span-4 lg:sticky lg:top-6 lg:self-start space-y-4">
                    <ProcessStepDetailPanel />
                  </aside>
                </div>

                <RefineModal open={refineOpen} onClose={() => setRefineOpen(false)} />
              </>
            ) : (
              <div className="section-card p-8 text-center text-sm text-[var(--text-muted)]">
                No process map generated yet. Go back to sources and generate.
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
