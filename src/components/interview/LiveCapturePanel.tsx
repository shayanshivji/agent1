"use client";

import { Loader2, MessageSquarePlus, Sparkles, Trash2 } from "lucide-react";
import { useInterviewStore } from "@/store/interview-execution-store";

export function LiveCapturePanel() {
  const {
    liveTurns,
    liveDraft,
    liveSpeaker,
    suggestedFollowUps,
    isSuggesting,
    workflowId,
    roleId,
    document,
    setLiveDraft,
    setLiveSpeaker,
    addLiveTurn,
    removeLiveTurn,
    setSuggestedFollowUps,
    setSuggesting,
  } = useInterviewStore();

  async function handleSuggest() {
    setSuggesting(true);
    try {
      const res = await fetch("/api/interview-live-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId,
          roleId,
          roleName: document?.roleName,
          document,
          recentTurns: liveTurns.slice(-6).map((t) => ({ speaker: t.speaker, content: t.content })),
        }),
      });
      const data = await res.json();
      if (res.ok) setSuggestedFollowUps(data.followUps ?? []);
    } finally {
      setSuggesting(false);
    }
  }

  function submitTurn() {
    if (!liveDraft.trim()) return;
    addLiveTurn(liveDraft.trim());
  }

  return (
    <div className="section-card overflow-hidden">
      <div className="px-4 py-3 section-card-header flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)]">Live interview capture</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Record Q&A turns; coverage updates in real time</p>
        </div>
        {document && (
          <span className="text-xs font-semibold text-[var(--accent)]">
            Coverage: {document.coverage.score}%
          </span>
        )}
      </div>
      <div className="p-4 space-y-4">
        <div className="max-h-64 overflow-y-auto space-y-2 border border-[var(--border)] rounded-md p-3 bg-[rgba(6,8,15,0.4)]">
          {liveTurns.length === 0 && (
            <p className="text-xs text-[var(--text-muted)] italic">No turns captured yet.</p>
          )}
          {liveTurns.map((t) => (
            <div
              key={t.id}
              className={`text-xs rounded p-2 ${
                t.speaker === "interviewer"
                  ? "bg-[var(--accent)]/10 border border-[var(--accent)]/20 ml-0 mr-8"
                  : "bg-slate-800/50 border border-[var(--border)] ml-8 mr-0"
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="font-semibold uppercase text-[10px] text-[var(--text-muted)]">
                  {t.speaker}
                </span>
                <button type="button" onClick={() => removeLiveTurn(t.id)}>
                  <Trash2 className="h-3 w-3 text-[var(--text-muted)] hover:text-red-400" />
                </button>
              </div>
              <p className="mt-1 text-[var(--text)]">{t.content}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <select
            value={liveSpeaker}
            onChange={(e) => setLiveSpeaker(e.target.value as "interviewer" | "interviewee")}
            className="field-input w-36"
          >
            <option value="interviewer">Interviewer</option>
            <option value="interviewee">Interviewee</option>
          </select>
          <input
            value={liveDraft}
            onChange={(e) => setLiveDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitTurn()}
            placeholder="Type question or response…"
            className="field-input flex-1"
          />
          <button type="button" onClick={submitTurn} className="btn-primary shrink-0">
            <MessageSquarePlus className="h-4 w-4" />
          </button>
        </div>

        <button type="button" onClick={handleSuggest} disabled={isSuggesting} className="btn-secondary w-full justify-center text-xs">
          {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Suggest follow-up questions
        </button>

        {suggestedFollowUps.length > 0 && (
          <div className="border border-[var(--border)] rounded-md p-3">
            <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-2">Suggested follow-ups</p>
            <ul className="space-y-1.5">
              {suggestedFollowUps.map((q, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => {
                      setLiveSpeaker("interviewer");
                      setLiveDraft(q);
                    }}
                    className="text-left text-xs text-[var(--accent)] hover:underline"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
