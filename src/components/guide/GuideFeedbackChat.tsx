"use client";

import { useState } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { useGuideStore } from "@/store/guide-store";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface GuideFeedbackChatProps {
  llmEnabled?: boolean | null;
}

export function GuideFeedbackChat({ llmEnabled }: GuideFeedbackChatProps) {
  const {
    guide,
    workflowId,
    roleId,
    level,
    customNotes,
    interviewObjective,
    sources,
    companyName,
    industryId,
    functionId,
    replaceGuideSections,
  } = useGuideStore();

  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const feedback = draft.trim();
    if (!feedback || !guide || refining) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: feedback,
    };
    setMessages((m) => [...m, userMsg]);
    setDraft("");
    setRefining(true);
    setError(null);

    try {
      if (!llmEnabled) {
        setMessages((m) => [
          ...m,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "LLM mode is required for agent revisions. Edit questions directly, or add an OpenAI API key.",
          },
        ]);
        return;
      }

      const res = await fetch("/api/refine-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: guide.sections,
          feedback,
          workflowId,
          roleId,
          level,
          customNotes,
          interviewObjective,
          sources,
          companyName,
          industryId,
          functionId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Revision failed");

      replaceGuideSections(data.sections);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Updated the guide based on your feedback. Review the changes above.",
        },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Revision failed";
      setError(msg);
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", content: msg },
      ]);
    } finally {
      setRefining(false);
    }
  }

  if (!guide) return null;

  return (
    <div className="guide-feedback-chat section-card overflow-hidden">
      <div className="px-4 py-3 section-card-header flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-[var(--accent)]" />
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)]">Agent feedback</h3>
          <p className="text-[10px] text-[var(--text-muted)]">
            Tell the agent what to fix, add, or rewrite
          </p>
        </div>
      </div>

      <div className="guide-feedback-messages px-4 py-3 max-h-48 overflow-y-auto space-y-2">
        {messages.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic">
            e.g. &quot;Add more questions on system handoffs&quot; or &quot;Pain points are too generic — probe Engage queue rework&quot;
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`text-xs rounded-md px-3 py-2 ${
                m.role === "user"
                  ? "bg-[var(--accent-soft)] border border-[var(--border-glow)]"
                  : "bg-[rgba(139,92,246,0.08)] border border-[var(--border)]"
              }`}
            >
              {m.content}
            </div>
          ))
        )}
      </div>

      {error && <p className="px-4 text-xs text-red-400">{error}</p>}

      <div className="px-4 pb-4 flex gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What's missing or wrong in this guide?"
          rows={2}
          className="field-input text-xs resize-none flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={refining || !draft.trim()}
          className="btn-primary px-3 self-end"
        >
          {refining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
