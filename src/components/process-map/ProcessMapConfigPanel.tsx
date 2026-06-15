"use client";

import {
  FUNCTIONS,
  INDUSTRIES,
  useBsnCatalog,
} from "@/data/engagement-context";
import { resolveWorkflows } from "@/data/catalog";
import { useProcessMapStore } from "@/store/process-map-store";
import type { InputMode } from "@/types/initiative";
import { Loader2, RotateCcw, Sparkles } from "lucide-react";

interface Props {
  onGenerate?: () => void;
  onClear?: () => void;
  isGenerating?: boolean;
  hasWork?: boolean;
  staged?: boolean;
}

export function ProcessMapConfigPanel({
  onGenerate,
  onClear,
  isGenerating,
  hasWork,
  staged,
}: Props) {
  const {
    companyName,
    industryId,
    functionId,
    workflowId,
    inputMode,
    customNotes,
    setCompanyName,
    setIndustryId,
    setFunctionId,
    setWorkflowId,
    setInputMode,
    setCustomNotes,
    getContext,
  } = useProcessMapStore();

  const ctx = getContext();
  const workflows = resolveWorkflows(ctx);
  const isBsn = useBsnCatalog(industryId, functionId);

  return (
    <div className="section-card overflow-hidden">
      <div className="px-4 py-3 section-card-header">
        <h2 className="text-sm font-semibold text-[var(--text)]">Configuration</h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          ProcessAI-style current-state mapping from notes, transcripts, or pipeline
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
            <option value="standalone">Standalone, notes, transcripts, docs</option>
            <option value="pipeline">Pipeline, prior agent JSON</option>
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

        {!staged && (
          <div>
            <label className="field-label">Instructions</label>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Focus areas, in-flight programs to flag, SME names…"
              rows={2}
              className="field-input resize-y"
            />
          </div>
        )}

        {!staged && onGenerate && (
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
            Generate process map
          </button>
        )}

        {!staged && onClear && (
          <button
            type="button"
            onClick={onClear}
            disabled={isGenerating || !hasWork}
            className="w-full btn-secondary justify-center"
          >
            <RotateCcw className="h-4 w-4" />
            Clear & start over
          </button>
        )}
      </div>
    </div>
  );
}
