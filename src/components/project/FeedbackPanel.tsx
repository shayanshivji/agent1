"use client";

import { useState } from "react";
import { MessageSquare, RefreshCw, Send, AlertCircle } from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import type { PlatformAgentSlug } from "@/types/platform-session";

interface FeedbackPanelProps {
  activeAgentSlug?: PlatformAgentSlug | null;
}

export function FeedbackPanel({ activeAgentSlug }: FeedbackPanelProps) {
  const [draft, setDraft] = useState("");
  const project = useProjectStore((s) => s.getActiveProject());
  const addFeedback = useProjectStore((s) => s.addFeedback);
  const pending = useProjectStore((s) => s.pendingFeedbackAction);

  const recent = project?.feedbackLog.slice(-8) ?? [];

  function submit(action?: "clarify" | "regenerate" | "correction" | "note") {
    const text = draft.trim();
    if (!text) return;
    addFeedback({
      agentSlug: activeAgentSlug ?? null,
      role: "user",
      content: text,
      action: action ?? "note",
    });
    setDraft("");
    if (action === "regenerate") {
      addFeedback({
        agentSlug: activeAgentSlug ?? null,
        role: "assistant",
        content:
          "Noted. Use the agent's Regenerate or Reprocess control to apply this feedback, or refine specific sections in the output view.",
        action: "note",
      });
    }
  }

  return (
    <aside className="feedback-panel" aria-label="Contextual feedback">
      <div className="feedback-panel-header">
        <MessageSquare className="h-4 w-4 text-[var(--accent)]" />
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">Study feedback</p>
          <p className="text-[10px] text-[var(--text-muted)]">
            {activeAgentSlug ? `Context: ${activeAgentSlug.replace(/-/g, " ")}` : "Project-wide"}
          </p>
        </div>
      </div>

      {pending && (
        <div className="mx-3 mt-3 rounded-md border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-2 text-xs">
          <p className="font-medium text-[var(--accent)] flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            Action pending
          </p>
          <p className="text-[var(--text-muted)] mt-1">{pending.content}</p>
        </div>
      )}

      <div className="feedback-panel-messages">
        {recent.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic px-1">
            Ask for clarifications, flag misunderstandings, or request a rewrite of the current output.
          </p>
        ) : (
          recent.map((m) => (
            <div
              key={m.id}
              className={`feedback-bubble ${m.role === "user" ? "feedback-bubble-user" : "feedback-bubble-assistant"}`}
            >
              <p className="text-[10px] text-[var(--text-muted)] mb-0.5">
                {m.role === "user" ? "You" : "Assistant"}
                {m.action ? ` · ${m.action}` : ""}
              </p>
              <p className="text-xs leading-relaxed">{m.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="feedback-panel-compose">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tell the agent what to fix or clarify…"
          rows={3}
          className="field-input text-xs resize-none"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          <button type="button" onClick={() => submit("note")} disabled={!draft.trim()} className="btn-secondary text-[10px] py-1 flex-1 justify-center">
            <Send className="h-3 w-3" />
            Note
          </button>
          <button type="button" onClick={() => submit("regenerate")} disabled={!draft.trim()} className="btn-primary text-[10px] py-1 flex-1 justify-center">
            <RefreshCw className="h-3 w-3" />
            Regenerate
          </button>
        </div>
      </div>
    </aside>
  );
}
