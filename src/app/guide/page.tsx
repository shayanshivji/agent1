"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { ConfigPanel } from "@/components/guide/ConfigPanel";
import { GuideEditor } from "@/components/guide/GuideEditor";
import { SourcePanel } from "@/components/guide/SourcePanel";
import { WorkflowStepper } from "@/components/guide/WorkflowStepper";
import { buildGuideFromResponse, useGuideStore } from "@/store/guide-store";

export default function GuidePage() {
  const {
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="consulting-header px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/50">
                Agent 1
              </p>
              <h1 className="text-lg font-semibold">
                Interview Guide Creation
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {llmEnabled !== null && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full ${
                  llmEnabled
                    ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30"
                    : "bg-amber-500/20 text-amber-200 border border-amber-400/30"
                }`}
              >
                {llmEnabled ? "LLM mode available" : "Template mode (no API key)"}
              </span>
            )}
            {lastGenerationMode && guide && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/70">
                Last run: {lastGenerationMode}
              </span>
            )}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2 bg-white text-[var(--mck-navy)] text-sm font-semibold rounded-md hover:bg-white/90 disabled:opacity-60"
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
      </header>

      <div className="bg-white border-b border-[var(--border)]">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <WorkflowStepper currentStep={currentStep} hasGuide={Boolean(guide)} />
        </div>
      </div>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-6">
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-6 lg:self-start">
            <ConfigPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
          </aside>

          <section className="lg:col-span-6">
            {isGenerating ? (
              <div className="section-card p-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
                <p className="text-sm text-[var(--text-muted)]">
                  Synthesizing guide…
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {llmEnabled
                    ? "Calling OpenAI with BSN catalog + McKinsey frameworks + your sources"
                    : "Building from BSN seed template (set OPENAI_API_KEY for LLM)"}
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
    </div>
  );
}
