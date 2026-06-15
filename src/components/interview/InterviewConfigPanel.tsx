"use client";

import {
  FUNCTIONS,
  INDUSTRIES,
  useBsnCatalog,
} from "@/data/engagement-context";
import { resolveRoles, resolveWorkflows } from "@/data/catalog";
import { useInterviewStore } from "@/store/interview-execution-store";
import type { InputMode } from "@/types/initiative";
import type { InterviewExecutionMode } from "@/types/interview-execution";

interface Props {
  staged?: boolean;
}

export function InterviewConfigPanel({ staged }: Props) {
  const {
    companyName,
    industryId,
    functionId,
    workflowId,
    roleId,
    mode,
    inputMode,
    stakeholderName,
    setCompanyName,
    setIndustryId,
    setFunctionId,
    setWorkflowId,
    setRoleId,
    setMode,
    setInputMode,
    setStakeholderName,
    getContext,
  } = useInterviewStore();

  const ctx = getContext();
  const workflows = resolveWorkflows(ctx);
  const roles = resolveRoles(ctx);
  const isBsn = useBsnCatalog(industryId, functionId);

  return (
    <div className="section-card overflow-hidden">
      <div className="px-4 py-3 section-card-header">
        <h2 className="text-sm font-semibold text-[var(--text)]">Configuration</h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Interview intelligence: live capture or transcript processing
        </p>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="field-label">Execution mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as InterviewExecutionMode)}
            className="field-input"
          >
            <option value="transcript">Transcript processing</option>
            <option value="live">Live interview</option>
          </select>
          {mode === "live" && (
            <p className="text-xs text-[var(--accent)] mt-2">
              Live mode auto-loads the interview guide from Scoping Agent when available.
            </p>
          )}
        </div>
        <div>
          <label className="field-label">Input mode</label>
          <select
            value={inputMode}
            onChange={(e) => setInputMode(e.target.value as InputMode)}
            className="field-input"
          >
            <option value="standalone">Standalone, notes, transcripts</option>
            <option value="pipeline">Pipeline, Agent 1 guide JSON</option>
          </select>
        </div>
        <div>
          <label className="field-label">Company</label>
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="field-input" />
        </div>
        <div>
          <label className="field-label">Industry</label>
          <select value={industryId} onChange={(e) => setIndustryId(e.target.value)} className="field-input">
            {INDUSTRIES.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Function</label>
          <select value={functionId} onChange={(e) => setFunctionId(e.target.value)} className="field-input">
            {FUNCTIONS.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          {isBsn && <p className="text-xs text-emerald-400 mt-1">BSN interview seeds loaded</p>}
        </div>
        <div>
          <label className="field-label">Workflow / process</label>
          <select value={workflowId} onChange={(e) => setWorkflowId(e.target.value)} className="field-input">
            {workflows.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Stakeholder role</label>
          <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="field-input">
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Stakeholder name for this interview</label>
          <input
            value={stakeholderName}
            onChange={(e) => setStakeholderName(e.target.value)}
            placeholder="SME name — labels this interview session and chat turns"
            className="field-input"
          />
        </div>
      </div>
    </div>
  );
}
