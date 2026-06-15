"use client";

import {
  FUNCTIONS,
  INDUSTRIES,
  useBsnCatalog,
} from "@/data/engagement-context";
import { resolveRoles, resolveWorkflows } from "@/data/catalog";
import { useGuideStore } from "@/store/guide-store";
import type { InterviewLevel } from "@/types/guide";
import { Loader2, Sparkles } from "lucide-react";

const LEVELS: { value: InterviewLevel; label: string }[] = [
  { value: "intro", label: "Intro (30 min)" },
  { value: "deep_dive", label: "Deep dive (60 min)" },
  { value: "validation", label: "Validation (45 min)" },
];

interface ConfigPanelProps {
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export function ConfigPanel({ onGenerate, isGenerating }: ConfigPanelProps) {
  const {
    companyName,
    industryId,
    functionId,
    workflowId,
    roleId,
    level,
    customNotes,
    setCompanyName,
    setIndustryId,
    setFunctionId,
    setWorkflowId,
    setRoleId,
    setLevel,
    setCustomNotes,
    getContext,
  } = useGuideStore();

  const ctx = getContext();
  const workflows = resolveWorkflows(ctx);
  const roles = resolveRoles(ctx);
  const workflow = workflows.find((w) => w.id === workflowId);
  const role = roles.find((r) => r.id === roleId);
  const isBsn = useBsnCatalog(industryId, functionId);

  return (
    <div className="section-card overflow-hidden">
      <div className="px-4 py-3 section-card-header">
        <h2 className="text-sm font-semibold text-[var(--text)]">
          Engagement context
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Industry + function drive workflow catalog
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="field-label">Company / client</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Varsity Brands / BSN Sports"
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
          {isBsn ? (
            <p className="text-xs text-emerald-400 mt-1.5">
              BSN-specific workflow & role catalog loaded
            </p>
          ) : (
            <p className="text-xs text-[var(--text-muted)] mt-1.5">
              Generic diagnostic templates for this industry/function
            </p>
          )}
        </div>

        <div className="border-t border-[var(--border)] pt-4">
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
          {workflow && (
            <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
              {workflow.description}
            </p>
          )}
        </div>

        <div>
          <label className="field-label">Role / stakeholder</label>
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="field-input"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          {role && (
            <p className="text-xs text-[var(--text-muted)] mt-1.5">
              {role.pod} · {role.description}
            </p>
          )}
        </div>

        <div>
          <label className="field-label">Interview level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as InterviewLevel)}
            className="field-input"
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Notes / instructions</label>
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="e.g. Focus on Fall peak season, probe in-flight NSP initiative…"
            rows={3}
            className="field-input resize-y"
          />
        </div>

        {onGenerate && (
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 btn-primary lg:hidden"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate guide
          </button>
        )}
      </div>
    </div>
  );
}
