"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Mic,
  MicOff,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useInterviewStore } from "@/store/interview-execution-store";
import { useGuideStore } from "@/store/guide-store";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { computeGuideCoverage } from "@/lib/pipeline/guide-handoff";

export function InterviewChatPanel() {
  const scopingGuide = useGuideStore((s) => s.guide);
  const {
    liveTurns,
    liveDraft,
    liveSpeaker,
    guideQuestions,
    guideSource,
    linkedGuideId,
    stakeholderName,
    suggestedFollowUps,
    isSuggesting,
    workflowId,
    roleId,
    document,
    setLiveDraft,
    setLiveSpeaker,
    addLiveTurn,
    removeLiveTurn,
    askGuideQuestion,
    importGuideFromScoping,
    setSuggestedFollowUps,
    setSuggesting,
  } = useInterviewStore();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const coverageScore = guideQuestions.length
    ? computeGuideCoverage(guideQuestions)
    : document?.coverage.score ?? 0;

  const handleTranscript = useCallback(
    (text: string) => {
      setLiveDraft(text);
    },
    [setLiveDraft],
  );

  const { isListening, isSupported, error: speechError, toggle: toggleMic, stop: stopMic } =
    useSpeechRecognition(handleTranscript);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveTurns.length]);

  useEffect(() => {
    if (scopingGuide && !linkedGuideId) {
      importGuideFromScoping();
    }
  }, [scopingGuide, linkedGuideId, importGuideFromScoping]);

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
          guideQuestions: guideQuestions
            .filter((q) => q.status === "pending")
            .map((q) => q.text),
          recentTurns: liveTurns.slice(-6).map((t) => ({ speaker: t.speaker, content: t.content })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuggestedFollowUps(data.followUps ?? []);
      } else {
        setSuggestedFollowUps([]);
      }
    } finally {
      setSuggesting(false);
    }
  }

  function sendMessage() {
    if (!liveDraft.trim()) return;
    stopMic();
    addLiveTurn(liveDraft.trim());
    setLiveSpeaker(liveSpeaker === "interviewer" ? "interviewee" : "interviewer");
  }

  function toggleMicForSpeaker() {
    if (!isSupported) return;
    if (isListening) stopMic();
    else toggleMic();
  }

  const micTitle = isSupported
    ? liveSpeaker === "interviewee"
      ? "Transcribe SME answer (mic)"
      : "Transcribe your question (mic)"
    : "Speech recognition requires Chrome or Edge";

  return (
    <div className="section-card overflow-hidden">
      <div className="px-4 py-3 section-card-header flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)]">Live interview chat</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Guide questions from Scoping · use the mic to transcribe questions and SME answers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--accent)]">Coverage: {coverageScore}%</span>
          <button
            type="button"
            onClick={() => importGuideFromScoping(true)}
            className="btn-secondary text-xs py-1"
            title="Re-pull guide from Scoping Agent"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync guide
          </button>
        </div>
      </div>

      {guideSource === "scoping" && linkedGuideId && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
          Loaded interview guide from Scoping Agent
          {scopingGuide ? ` · ${scopingGuide.workflowName} / ${scopingGuide.roleName}` : ""}
          {guideQuestions.length > 0 && ` · ${guideQuestions.length} questions`}
        </div>
      )}

      {!guideQuestions.length && !linkedGuideId && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-md bg-[var(--accent)]/5 border border-[var(--border)] text-xs text-[var(--text-muted)]">
          No guide loaded. Use the upstream banner above, Sync guide, or paste guide JSON in context.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-4 p-4">
        <aside className="lg:col-span-4 mb-4 lg:mb-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Interview guide questions
          </p>
          <div className="max-h-[420px] overflow-y-auto space-y-2 border border-[var(--border)] rounded-md p-2 bg-[var(--surface-muted)]">
            {guideQuestions.length === 0 && (
              <p className="text-xs text-[var(--text-muted)] italic p-2">Questions appear when guide is loaded.</p>
            )}
            {guideQuestions.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => askGuideQuestion(q.id)}
                className={`w-full text-left rounded-md p-2.5 border transition-colors ${
                  q.status === "answered"
                    ? "border-emerald-300 bg-emerald-50"
                    : q.status === "asked"
                      ? "border-amber-300 bg-amber-50"
                      : "border-[var(--border)] hover:border-[var(--accent)]/50 bg-white"
                }`}
              >
                <div className="flex items-start gap-2">
                  {q.status === "answered" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase text-[var(--accent)]">{q.sectionLabel}</span>
                    <p className="text-xs text-[var(--text)] mt-0.5 line-clamp-3">{q.text}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="lg:col-span-8 flex flex-col min-h-[480px]">
          <div className="flex-1 overflow-y-auto space-y-3 border border-[var(--border)] rounded-md p-3 bg-[var(--surface-muted)] max-h-[380px]">
            {liveTurns.length === 0 && (
              <p className="text-xs text-[var(--text-muted)] italic text-center py-8">
                Click a guide question to ask it, type below, or use the mic to transcribe speech.
              </p>
            )}
            {liveTurns.map((t) => (
              <div
                key={t.id}
                className={`flex ${t.speaker === "interviewer" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    t.speaker === "interviewer"
                      ? "bg-[var(--accent)]/10 border border-[var(--accent)]/25 text-[var(--text)]"
                      : "bg-white border border-[var(--border)] text-[var(--text)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                      {t.speaker === "interviewer" ? "You" : stakeholderName || "Interviewee"}
                    </span>
                    <button type="button" onClick={() => removeLiveTurn(t.id)}>
                      <Trash2 className="h-3 w-3 text-[var(--text-muted)] hover:text-red-500" />
                    </button>
                  </div>
                  <p className="leading-relaxed">{t.content}</p>
                  <p className="text-[9px] text-[var(--text-muted)] mt-1">
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex rounded-md border border-[var(--border)] overflow-hidden shrink-0 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    stopMic();
                    setLiveSpeaker("interviewer");
                  }}
                  className={`px-3 py-1.5 text-xs ${liveSpeaker === "interviewer" ? "bg-[var(--accent)]/15 text-[var(--accent)] font-semibold" : "text-[var(--text-muted)]"}`}
                >
                  You
                </button>
                <button
                  type="button"
                  onClick={() => setLiveSpeaker("interviewee")}
                  className={`px-3 py-1.5 text-xs border-l border-[var(--border)] ${liveSpeaker === "interviewee" ? "bg-[var(--accent)]/15 text-[var(--accent)] font-semibold" : "text-[var(--text-muted)]"}`}
                >
                  {stakeholderName || "SME"}
                </button>
              </div>

              <button
                type="button"
                onClick={toggleMicForSpeaker}
                disabled={!isSupported}
                className={`btn-secondary text-xs py-1.5 shrink-0 ${
                  isListening ? "border-red-400 text-red-600 bg-red-50" : ""
                } ${!isSupported ? "opacity-60 cursor-not-allowed" : ""}`}
                title={micTitle}
              >
                {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                {isListening ? "Stop mic" : "Mic"}
              </button>

              {isListening && (
                <span className="flex items-center gap-1.5 text-xs text-red-600 animate-pulse">
                  Listening…
                </span>
              )}
              {!isSupported && (
                <span className="text-[11px] text-[var(--text-muted)]">Mic needs Chrome or Edge</span>
              )}
            </div>

            <div className="flex gap-2">
              <textarea
                value={liveDraft}
                onChange={(e) => setLiveDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={
                  liveSpeaker === "interviewee"
                    ? "Type or use mic to capture interviewee response…"
                    : "Type or use mic for your question…"
                }
                rows={2}
                className="field-input flex-1 resize-none text-sm"
              />
              <button type="button" onClick={sendMessage} disabled={!liveDraft.trim()} className="btn-primary shrink-0 self-end">
                <Send className="h-4 w-4" />
              </button>
            </div>

            {speechError && <p className="text-xs text-red-600">{speechError}</p>}

            <button type="button" onClick={handleSuggest} disabled={isSuggesting} className="btn-secondary w-full justify-center text-xs">
              {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Suggest follow-up questions
            </button>

            {suggestedFollowUps.length > 0 && (
              <div className="border border-[var(--border)] rounded-md p-3 bg-white">
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
      </div>
    </div>
  );
}
