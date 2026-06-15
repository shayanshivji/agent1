"use client";

import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { useInterviewStore } from "@/store/interview-execution-store";
import {
  CONFIDENCE_LABELS,
  COVERAGE_STATUS_LABELS,
} from "@/types/interview-execution";
import {
  downloadAgent3Package,
  downloadInterviewCsv,
  downloadInterviewJson,
  downloadInterviewMarkdown,
} from "@/lib/export/interview-execution";

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    high: "bg-orange-500/20 text-orange-300",
    medium: "bg-yellow-500/20 text-yellow-300",
    low: "bg-slate-500/20 text-slate-300",
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${colors[severity] ?? colors.medium}`}>
      {severity}
    </span>
  );
}

export function InterviewTranscriptView() {
  const { document, liveTurns } = useInterviewStore();
  if (!document) return null;

  const text = document.transcriptRaw;
  const turns = document.liveTurns.length ? document.liveTurns : liveTurns;

  return (
    <div className="section-card p-4">
      {text ? (
        <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap font-mono max-h-[600px] overflow-y-auto">
          {text}
        </pre>
      ) : turns.length > 0 ? (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {turns.map((t) => (
            <div key={t.id} className="text-xs border border-[var(--border)] rounded p-2">
              <span className="font-semibold uppercase text-[10px] text-[var(--accent)]">{t.speaker}</span>
              <p className="mt-1">{t.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--text-muted)] italic">No transcript or live capture available.</p>
      )}
    </div>
  );
}

export function InterviewSummaryView() {
  const { document } = useInterviewStore();
  if (!document) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Coverage" value={`${document.coverage.score}%`} />
        <MetricCard label="Workflow steps" value={String(document.workflowSteps.length)} />
        <MetricCard label="Pain points" value={String(document.painPoints.length)} />
        <MetricCard label="Evidence items" value={String(document.evidenceRegistry.length)} />
      </div>
      <div className="section-card p-4">
        <h3 className="text-sm font-semibold mb-2">Executive summary</h3>
        <p className="text-sm text-[var(--text-muted)] whitespace-pre-wrap">{document.executiveSummary}</p>
      </div>
      {document.processActivities.length > 0 && (
        <div className="section-card p-4">
          <h3 className="text-sm font-semibold mb-3">Process activities</h3>
          <div className="space-y-2">
            {document.processActivities.map((a) => (
              <div key={a.id} className="border border-[var(--border)] rounded p-3 text-xs">
                <p className="font-medium text-[var(--text)]">{a.name}</p>
                <p className="text-[var(--text-muted)] mt-1">{a.description}</p>
                {a.frequency && <p className="text-[10px] text-[var(--accent)] mt-1">{a.frequency}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      {document.contradictions.length > 0 && (
        <div className="section-card p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <h3 className="text-sm font-semibold">Contradictions flagged</h3>
          </div>
          {document.contradictions.map((c) => (
            <div key={c.id} className="text-xs mb-3 last:mb-0">
              <p className="font-medium">{c.topic}</p>
              <p className="text-[var(--text-muted)] mt-1">A: {c.statementA} ({c.sourceA})</p>
              <p className="text-[var(--text-muted)]">B: {c.statementB} ({c.sourceB})</p>
            </div>
          ))}
        </div>
      )}
      {document.opportunities.length > 0 && (
        <div className="section-card p-4">
          <h3 className="text-sm font-semibold mb-3">Opportunities mentioned</h3>
          {document.opportunities.map((o) => (
            <div key={o.id} className="text-xs border border-[var(--border)] rounded p-2 mb-2">
              <p className="font-medium">{o.title}</p>
              <p className="text-[var(--text-muted)] mt-0.5">{o.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function InterviewWorkflowView() {
  const { document, updateWorkflowStep } = useInterviewStore();
  if (!document) return null;

  return (
    <div className="space-y-3">
      {document.workflowSteps
        .sort((a, b) => a.sequence - b.sequence)
        .map((s) => (
          <div key={s.id} className="section-card p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-bold text-[var(--accent)]">STEP {s.sequence + 1}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{CONFIDENCE_LABELS[s.confidence]}</span>
            </div>
            <input
              value={s.name}
              onChange={(e) => updateWorkflowStep(s.id, { name: e.target.value })}
              className="field-input mt-2 font-medium"
            />
            <textarea
              value={s.description}
              onChange={(e) => updateWorkflowStep(s.id, { description: e.target.value })}
              rows={2}
              className="field-input mt-2 text-xs resize-y"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {s.systems.map((sys) => (
                <span key={sys} className="text-[10px] px-2 py-0.5 rounded bg-slate-700/50">{sys}</span>
              ))}
              {s.actorRole && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)]">
                  {s.actorRole}
                </span>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}

export function InterviewPainView() {
  const { document, updatePainPoint } = useInterviewStore();
  if (!document) return null;

  return (
    <div className="space-y-3">
      {document.painPoints.map((p) => (
        <div key={p.id} className="section-card p-4">
          <div className="flex items-start justify-between gap-2">
            <input
              value={p.title}
              onChange={(e) => updatePainPoint(p.id, { title: e.target.value })}
              className="field-input font-medium flex-1"
            />
            <SeverityBadge severity={p.severity} />
          </div>
          <textarea
            value={p.description}
            onChange={(e) => updatePainPoint(p.id, { description: e.target.value })}
            rows={2}
            className="field-input mt-2 text-xs resize-y"
          />
          <p className="text-[10px] text-[var(--text-muted)] mt-2">
            Confidence: {CONFIDENCE_LABELS[p.confidence]}
          </p>
          {p.evidenceIds.length > 0 && (
            <div className="mt-2 p-2 rounded bg-[var(--accent)]/5 border border-[var(--accent)]/20">
              <p className="text-[10px] font-semibold text-[var(--accent)]">EVIDENCE</p>
              {document.evidenceRegistry
                .filter((e) => p.evidenceIds.includes(e.id))
                .map((e) => (
                  <p key={e.id} className="text-[10px] text-[var(--text-muted)] italic mt-1">&quot;{e.quote}&quot;</p>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function InterviewEvidenceView() {
  const { document, updateEvidence } = useInterviewStore();
  if (!document) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-muted)]">
        Evidence is stored separately from conclusions. Every insight should trace back here.
      </p>
      {document.evidenceRegistry.map((e) => (
        <div key={e.id} className="section-card p-4">
          <textarea
            value={e.quote}
            onChange={(ev) => updateEvidence(e.id, { quote: ev.target.value })}
            rows={2}
            className="field-input text-xs italic resize-y"
          />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <input
              value={e.source}
              onChange={(ev) => updateEvidence(e.id, { source: ev.target.value })}
              className="field-input text-xs"
              placeholder="Source"
            />
            <input
              value={e.lineRef ?? ""}
              onChange={(ev) => updateEvidence(e.id, { lineRef: ev.target.value })}
              className="field-input text-xs"
              placeholder="Line ref"
            />
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-2">
            Confidence: {CONFIDENCE_LABELS[e.confidence]}
          </p>
        </div>
      ))}
    </div>
  );
}

export function InterviewHandoffsView() {
  const { document } = useInterviewStore();
  if (!document) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {document.handoffs.map((h) => (
        <div key={h.id} className="section-card p-4">
          <p className="text-sm font-semibold text-[var(--accent)]">
            {h.fromRole} → {h.toRole}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-2">{h.description}</p>
          {h.trigger && (
            <p className="text-[10px] text-[var(--text-muted)] mt-2">Trigger: {h.trigger}</p>
          )}
          <p className="text-[10px] mt-2">{CONFIDENCE_LABELS[h.confidence]} confidence</p>
        </div>
      ))}
      {document.systems.length > 0 && (
        <div className="section-card p-4 md:col-span-2">
          <h3 className="text-sm font-semibold mb-3">Systems mentioned</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {document.systems.map((s) => (
              <div key={s.id} className="border border-[var(--border)] rounded p-2 text-xs">
                <p className="font-medium">{s.name}</p>
                <p className="text-[var(--text-muted)] mt-0.5">{s.usage}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function InterviewOpenQuestionsView() {
  const { document } = useInterviewStore();
  if (!document) return null;

  return (
    <div className="space-y-3">
      {document.openQuestions.map((q) => (
        <div key={q.id} className="section-card p-4 flex gap-3">
          <HelpCircle className="h-5 w-5 text-[var(--accent)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">{q.question}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{q.reason}</p>
            <span className="text-[10px] uppercase mt-2 inline-block text-[var(--text-muted)]">
              {q.priority} priority
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function InterviewCoverageView() {
  const { document } = useInterviewStore();
  if (!document) return null;

  const { coverage } = document;

  return (
    <div className="space-y-4">
      <div className="section-card p-4 flex items-center gap-4">
        <div
          className="text-4xl font-bold text-[var(--accent)]"
          style={{ color: coverage.score >= 80 ? "var(--accent)" : coverage.score >= 50 ? "#eab308" : "#f97316" }}
        >
          {coverage.score}%
        </div>
        <div>
          <p className="text-sm font-semibold">Interview coverage</p>
          <p className="text-xs text-[var(--text-muted)]">
            {coverage.missingTopics.length} topics still need exploration
          </p>
        </div>
      </div>

      {coverage.objectivesFromGuide.length > 0 && (
        <div className="section-card p-4">
          <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-2">Objectives from guide</p>
          <ul className="text-xs space-y-1 list-disc pl-4 text-[var(--text-muted)]">
            {coverage.objectivesFromGuide.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="section-card p-4">
        <p className="text-sm font-semibold mb-3">Topic coverage</p>
        <div className="space-y-2">
          {coverage.topics.map((t) => (
            <div key={t.id} className="flex items-center justify-between text-xs border border-[var(--border)] rounded p-2">
              <span>{t.name}</span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  t.status === "covered"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : t.status === "partial"
                      ? "bg-yellow-500/20 text-yellow-300"
                      : "bg-red-500/20 text-red-300"
                }`}
              >
                {COVERAGE_STATUS_LABELS[t.status]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {coverage.missingTopics.length > 0 && (
        <div className="section-card p-4 border-l-4 border-l-orange-500">
          <p className="text-sm font-semibold mb-2">Missing topics</p>
          <ul className="text-xs space-y-1">
            {coverage.missingTopics.map((t, i) => (
              <li key={i} className="text-[var(--text-muted)]">· {t}</li>
            ))}
          </ul>
        </div>
      )}

      {coverage.suggestedFollowUps.length > 0 && (
        <div className="section-card p-4">
          <p className="text-sm font-semibold mb-2">Suggested follow-ups</p>
          <ul className="text-xs space-y-1.5">
            {coverage.suggestedFollowUps.map((q, i) => (
              <li key={i} className="text-[var(--accent)]">{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function InterviewExportView() {
  const { document, setReviewStatus, versions, saveVersion, loadVersion } = useInterviewStore();
  if (!document) return null;

  return (
    <div className="space-y-4">
      <div className="section-card p-4">
        <p className="text-sm font-semibold mb-2">Human validation</p>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          Validate extracted content before exporting to Agent 3.
        </p>
        <div className="flex flex-wrap gap-2">
          {(["draft", "in_review", "validated"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setReviewStatus(s)}
              className={`text-xs px-3 py-1.5 rounded border ${
                document.reviewStatus === s
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-muted)]"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
        {document.reviewStatus === "validated" && (
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Ready for downstream handoff
          </p>
        )}
      </div>

      <div className="section-card p-4">
        <p className="text-sm font-semibold mb-3">Download</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => downloadInterviewMarkdown(document)} className="btn-secondary text-xs">
            Markdown
          </button>
          <button type="button" onClick={() => downloadInterviewCsv(document)} className="btn-secondary text-xs">
            CSV
          </button>
          <button type="button" onClick={() => downloadInterviewJson(document)} className="btn-secondary text-xs">
            Full JSON
          </button>
          <button type="button" onClick={() => downloadAgent3Package(document)} className="btn-primary text-xs">
            Agent 3 Package
          </button>
        </div>
        <a href="/agents/process-mapping/workspace" className="inline-block mt-3 text-xs text-[var(--accent)] hover:underline">
          Open Process Mapping Agent →
        </a>
      </div>

      <div className="section-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Version history</p>
          <button type="button" onClick={() => saveVersion()} className="btn-secondary text-xs">
            Save snapshot
          </button>
        </div>
        {versions.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic">No saved versions yet.</p>
        ) : (
          <ul className="space-y-2">
            {versions.map((v) => (
              <li key={v.id} className="flex items-center justify-between text-xs border border-[var(--border)] rounded p-2">
                <span>{v.label} · {new Date(v.savedAt).toLocaleString()}</span>
                <button type="button" onClick={() => loadVersion(v.id)} className="text-[var(--accent)] hover:underline">
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="section-card p-4">
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p className="text-2xl font-bold mt-1 text-[var(--text)]">{value}</p>
    </div>
  );
}
