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

  const handleTranscript = useCallback(function handleTranscript(text: string, isFinal: boolean) {
    if (isFinal) {
      setLiveDraft(text);
      setLiveSpeaker("interviewee");
    } else {
      setLiveDraft(text);
    }
  }, [setLiveDraft, setLiveSpeaker]);

  const { isListening, isSupported, error: speechError, toggle: toggleMic, stop: stopMic } =
    useSpeechRecognition(handleTranscript);

  useEffect(() => {
    useInterviewStore.getState().importGuideFromScoping();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveTurns.length]);

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

  function sendMessage() {
    if (!liveDraft.trim()) return;
    stopMic();
    addLiveTurn(liveDraft.trim());
    setLiveSpeaker(liveSpeaker === "interviewer" ? "interviewee" : "interviewer");
  }

  function startIntervieweeMic() {
    setLiveSpeaker("interviewee");
    if (!isListening) toggleMic();
  }

  return (
    <div className="section-card overflow-hidden">
      <div className="px-4 py-3 section-card-header flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)]">Live interview chat</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Guide questions from Scoping · transcribe interviewee answers with mic
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
        <div className="mx-4 mt-3 px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
          Loaded interview guide from Scoping Agent
          {scopingGuide ? ` · ${scopingGuide.workflowName} / ${scopingGuide.roleName}` : ""}
          {guideQuestions.length > 0 && ` · ${guideQuestions.length} questions`}
        </div>
      )}

      {!guideQuestions.length && scopingGuide && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-200">
          Scoping guide found but no questions extracted.{" "}
          <button type="button" onClick={() => importGuideFromScoping(true)} className="underline">
            Retry import
          </button>
        </div>
      )}

      {!scopingGuide && !guideQuestions.length && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-md bg-[var(--accent)]/5 border border-[var(--border)] text-xs text-[var(--text-muted)]">
          No guide in Scoping Agent yet. Generate a guide in Agent 1, or paste guide JSON below.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-4 p-4">
        {/* Guide questions sidebar */}
        <aside className="lg:col-span-4 mb-4 lg:mb-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Interview guide questions
          </p>
          <div className="max-h-[420px] overflow-y-auto space-y-2 border border-[var(--border)] rounded-md p-2 bg-[rgba(6,8,15,0.4)]">
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
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : q.status === "asked"
                      ? "border-yellow-500/40 bg-yellow-500/5"
                      : "border-[var(--border)] hover:border-[var(--accent)]/50"
                }`}
              >
                <div className="flex items-start gap-2">
                  {q.status === "answered" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
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

        {/* Chat thread */}
        <div className="lg:col-span-8 flex flex-col min-h-[480px]">
          <div className="flex-1 overflow-y-auto space-y-3 border border-[var(--border)] rounded-md p-3 bg-[rgba(6,8,15,0.35)] max-h-[380px]">
            {liveTurns.length === 0 && (
              <p className="text-xs text-[var(--text-muted)] italic text-center py-8">
                Click a guide question to ask it, or type below. Use the mic to transcribe interviewee answers.
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
                      ? "bg-[var(--accent)]/15 border border-[var(--accent)]/25 text-[var(--text)]"
                      : "bg-slate-800/80 border border-[var(--border)] text-[var(--text)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
                      {t.speaker === "interviewer" ? "You" : stakeholderName || "Interviewee"}
                    </span>
                    <button type="button" onClick={() => removeLiveTurn(t.id)}>
                      <Trash2 className="h-3 w-3 text-[var(--text-muted)] hover:text-red-400" />
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

          {/* Composer */}
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <div className="flex rounded-md border border-[var(--border)] overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => { stopMic(); setLiveSpeaker("interviewer"); }}
                  className={`px-3 py-1.5 text-xs ${liveSpeaker === "interviewer" ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "text-[var(--text-muted)]"}`}
                >
                  You
                </button>
                <button
                  type="button"
                  onClick={() => setLiveSpeaker("interviewee")}
                  className={`px-3 py-1.5 text-xs border-l border-[var(--border)] ${liveSpeaker === "interviewee" ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "text-[var(--text-muted)]"}`}
                >
                  {stakeholderName || "SME"}
                </button>
              </div>
              {isListening && (
                <span className="flex items-center gap-1.5 text-xs text-red-400 animate-pulse">
                  <Mic className="h-3.5 w-3.5" /> Listening…
                </span>
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
                    : "Type your question…"
                }
                rows={2}
                className="field-input flex-1 resize-none text-sm"
              />
              {liveSpeaker === "interviewee" && isSupported && (
                <button
                  type="button"
                  onClick={isListening ? stopMic : startIntervieweeMic}
                  className={`btn-secondary shrink-0 ${isListening ? "border-red-500/50 text-red-400" : ""}`}
                  title="Transcribe interviewee speech"
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
              <button type="button" onClick={sendMessage} disabled={!liveDraft.trim()} className="btn-primary shrink-0 self-end">
                <Send className="h-4 w-4" />
              </button>
            </div>

            {speechError && <p className="text-xs text-red-400">{speechError}</p>}

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
      </div>
    </div>
  );
}
