"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { BSN_PRESET } from "@/data/engagement-context";
import { INTERVIEW_DEFAULTS } from "@/lib/interview-execution/logic";
import { useInterviewStore } from "@/store/interview-execution-store";
import { InterviewConfigPanel } from "@/components/interview/InterviewConfigPanel";
import { InterviewContextPanel } from "@/components/interview/InterviewContextPanel";
import { InterviewSourcesPanel } from "@/components/interview/InterviewSourcesPanel";
import { LiveCapturePanel } from "@/components/interview/LiveCapturePanel";
import { InterviewTabs } from "@/components/interview/InterviewTabs";
import {
  InterviewTranscriptView,
  InterviewSummaryView,
  InterviewWorkflowView,
  InterviewPainView,
  InterviewEvidenceView,
  InterviewHandoffsView,
  InterviewOpenQuestionsView,
  InterviewCoverageView,
  InterviewExportView,
} from "@/components/interview/InterviewTabViews";
import { WorkspaceBackLink } from "@/components/layout/WorkspaceBackLink";
import {
  DEFAULT_WORKSPACE_STAGES,
  WorkspaceStageStepper,
} from "@/components/workspace/WorkspaceStageStepper";
import { StageFooter } from "@/components/workspace/StageFooter";

export function LiveInterviewAgentWorkspace() {
  const {
    companyName,
    industryId,
    functionId,
    workflowId,
    roleId,
    mode,
    inputMode,
    customNotes,
    guidePayload,
    transcriptText,
    stakeholderName,
    sources,
    liveTurns,
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
  } = useInterviewStore();

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
    liveTurns.length > 0 ||
    customNotes.trim().length > 0 ||
    guidePayload.trim().length > 0 ||
    transcriptText.trim().length > 0 ||
    companyName !== BSN_PRESET.companyName ||
    workflowId !== INTERVIEW_DEFAULTS.workflowId;

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          industryId,
          functionId,
          workflowId,
          roleId,
          mode,
          inputMode,
          stakeholderName: stakeholderName || undefined,
          customNotes: customNotes || undefined,
          guidePayload,
          transcriptText,
          liveTurns,
          sources: sources.map((s) => ({ name: s.name, extractedText: s.extractedText })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      const doc = data.document;
      if (!doc.id) doc.id = crypto.randomUUID?.() ?? String(Date.now());
      const now = new Date().toISOString();
      if (!doc.createdAt) doc.createdAt = now;
      doc.updatedAt = now;
      doc.liveTurns = liveTurns.length ? liveTurns : doc.liveTurns ?? [];

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
    if (!window.confirm("Clear all configuration, sources, and interview output?")) return;
    reset();
    setError(null);
    setStage(1);
    setMaxStage(1);
  }

  function goToStep(next: number) {
    setStage(next);
    setMaxStage((m) => Math.max(m, next));
  }

  function renderTab() {
    switch (activeTab) {
      case "transcript":
        return <InterviewTranscriptView />;
      case "summary":
        return <InterviewSummaryView />;
      case "workflow":
        return <InterviewWorkflowView />;
      case "pain":
        return <InterviewPainView />;
      case "evidence":
        return <InterviewEvidenceView />;
      case "handoffs":
        return <InterviewHandoffsView />;
      case "open_questions":
        return <InterviewOpenQuestionsView />;
      case "coverage":
        return <InterviewCoverageView />;
      case "export":
        return <InterviewExportView />;
      default:
        return <InterviewSummaryView />;
    }
  }

  return (
    <>
      <div className="toolbar-strip">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <WorkspaceBackLink slug="live-interview" label="Interview Agent" />
            <h1 className="text-lg font-semibold text-gradient mt-2">Interview Execution Agent</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Interview intelligence: live capture or transcript processing with evidence registry
            </p>
          </div>
          <div className="flex items-center gap-3">
            {llmEnabled !== null && (
              <span className={llmEnabled ? "badge-mode-llm" : "badge-mode-template"}>
                {llmEnabled ? "LLM mode" : "Template mode"}
              </span>
            )}
            {lastGenerationMode && document && stage === 3 && (
              <span className="text-xs px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)]">
                Last: {lastGenerationMode}
              </span>
            )}
            {stage === 3 && (
              <button type="button" onClick={handleClear} disabled={isGenerating || !hasWork} className="btn-secondary">
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
              <h2 className="text-xl font-semibold text-[var(--text)]">Configure run</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Choose live or transcript mode, workflow, and stakeholder role.
              </p>
            </div>
            <InterviewConfigPanel staged />
            <StageFooter stage={1} onContinue={() => goToStep(2)} continueLabel="Continue to sources" />
          </div>
        )}

        {stage === 2 && (
          <div className="workspace-stage-panel">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[var(--text)]">Add context & capture</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {mode === "live"
                  ? "Load Agent 1 guide, capture live Q&A, then process into structured output."
                  : "Upload transcript or paste notes, then extract structured interview intelligence."}
              </p>
            </div>
            <div className="space-y-4">
              {mode === "live" && <LiveCapturePanel />}
              <InterviewSourcesPanel />
              <InterviewContextPanel />
            </div>
            {isGenerating ? (
              <div className="section-card p-12 flex flex-col items-center gap-4 mt-6">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                <p className="text-sm text-[var(--text-muted)]">Processing interview intelligence…</p>
              </div>
            ) : (
              <StageFooter
                stage={2}
                isGenerating={isGenerating}
                onBack={() => goToStep(1)}
                onGenerate={handleGenerate}
                generateLabel={mode === "live" ? "Process live interview" : "Process transcript"}
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
                <p className="text-sm text-[var(--text-muted)]">Processing interview intelligence…</p>
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
                  <button type="button" onClick={handleGenerate} disabled={isGenerating} className="btn-primary text-xs">
                    Reprocess
                  </button>
                </div>
                <InterviewTabs />
                {renderTab()}
              </>
            ) : (
              <div className="section-card p-8 text-center text-sm text-[var(--text-muted)]">
                No interview output yet. Go back and process your transcript or live capture.
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
