"use client";

import { BSN_ROLES, BSN_WORKFLOWS } from "@/data/bsn-catalog";
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
    workflowId,
    roleId,
    level,
    customNotes,
    setWorkflowId,
    setRoleId,
    setLevel,
    setCustomNotes,
  } = useGuideStore();

  const workflow = BSN_WORKFLOWS.find((w) => w.id === workflowId);
  const role = BSN_ROLES.find((r) => r.id === roleId);

  return (
    <div className="section-card overflow-hidden">
      <div className="px-4 py-3 bg-[var(--bg)] border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold text-[var(--mck-navy)]">
          Configuration
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Workflow + role drive the guide content
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="field-label">Workflow / process</label>
          <select
            value={workflowId}
            onChange={(e) => setWorkflowId(e.target.value)}
            className="field-input"
          >
            {BSN_WORKFLOWS.map((w) => (
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
            {BSN_ROLES.map((r) => (
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
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--mck-navy)] text-white text-sm font-semibold rounded-md hover:opacity-90 disabled:opacity-60 lg:hidden"
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
