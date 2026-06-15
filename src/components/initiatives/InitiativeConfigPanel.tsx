"use client";

import {
  FUNCTIONS,
  INDUSTRIES,
  useBsnCatalog,
} from "@/data/engagement-context";
import { resolveWorkflows } from "@/data/catalog";
import { useInitiativeStore } from "@/store/initiative-store";
import type { InitiativeViewFilter, InputMode } from "@/types/initiative";
import { Loader2, RotateCcw, Sparkles } from "lucide-react";

const VIEW_FILTERS: { value: InitiativeViewFilter; label: string }[] = [
  { value: "comprehensive", label: "Comprehensive set" },
  { value: "top_priorities", label: "Top priorities only" },
  { value: "value_blockers", label: "Value blockers only" },
  { value: "ai_automation", label: "AI / automation levers" },
  { value: "process_redesign", label: "Process redesign levers" },
  { value: "horizon_h1", label: "Horizon H1 only" },
  { value: "horizon_h2", label: "Horizon H2 only" },
  { value: "horizon_h3", label: "Horizon H3 only" },
];

interface Props {
  onGenerate: () => void;
  onClear: () => void;
  isGenerating?: boolean;
  hasWork?: boolean;
}

export function InitiativeConfigPanel({
  onGenerate,
  onClear,
  isGenerating,
  hasWork,
}: Props) {
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
    setCompanyName,
    setIndustryId,
    setFunctionId,
    setWorkflowId,
    setInputMode,
    setViewFilter,
    setCustomNotes,
    setPipelinePayload,
    setProcessMapText,
    getContext,
  } = useInitiativeStore();

  const ctx = getContext();
  const workflows = resolveWorkflows(ctx);
  const isBsn = useBsnCatalog(industryId, functionId);

  return (
    <div className="section-card overflow-hidden">
      <div className="px-4 py-3 section-card-header">
        <h2 className="text-sm font-semibold text-[var(--text)]">Configuration</h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          McKinsey two-lens: value at stake + operating effectiveness
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="field-label">Input mode</label>
          <select
            value={inputMode}
            onChange={(e) => setInputMode(e.target.value as InputMode)}
            className="field-input"
          >
            <option value="standalone">Standalone — docs, notes, maps</option>
            <option value="pipeline">Pipeline — prior agent JSON</option>
          </select>
        </div>

        <div>
          <label className="field-label">Company</label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="field-input"
          />
        </div>

        <div>
          <label className="field-label">Industry</label>
          <select
            value={industryId}
            onChange={(e) => setIndustryId(e.target.value)}
            className="field-input"
          >
            {INDUSTRIES.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Function</label>
          <select
            value={functionId}
            onChange={(e) => setFunctionId(e.target.value)}
            className="field-input"
          >
            {FUNCTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          {isBsn && (
            <p className="text-xs text-emerald-400 mt-1">BSN process seeds loaded</p>
          )}
        </div>

        <div>
          <label className="field-label">Workflow / process</label>
          <select
            value={workflowId}
            onChange={(e) => setWorkflowId(e.target.value)}
            className="field-input"
          >
            {workflows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Initiative view</label>
          <select
            value={viewFilter}
            onChange={(e) => setViewFilter(e.target.value as InitiativeViewFilter)}
            className="field-input"
          >
            {VIEW_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {inputMode === "pipeline" && (
          <div>
            <label className="field-label">Pipeline JSON (Agents 1–3)</label>
            <textarea
              value={pipelinePayload}
              onChange={(e) => setPipelinePayload(e.target.value)}
              placeholder='Paste structured output: { "processSteps": [...], "painPoints": [...] }'
              rows={4}
              className="field-input font-mono text-xs resize-y"
            />
          </div>
        )}

        <div>
          <label className="field-label">Process map / notes (optional)</label>
          <textarea
            value={processMapText}
            onChange={(e) => setProcessMapText(e.target.value)}
            placeholder="Paste process map, transcript excerpts, or pain point list…"
            rows={3}
            className="field-input resize-y"
          />
        </div>

        <div>
          <label className="field-label">Instructions</label>
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="Strategic priorities, in-flight programs to flag…"
            rows={2}
            className="field-input resize-y"
          />
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full btn-primary justify-center"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate initiatives
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={isGenerating || !hasWork}
          className="w-full btn-secondary justify-center"
        >
          <RotateCcw className="h-4 w-4" />
          Clear & start over
        </button>
      </div>
    </div>
  );
}
