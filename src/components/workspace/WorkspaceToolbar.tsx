"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  BookmarkPlus,
  ChevronDown,
  FolderOpen,
  Home,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { WorkspaceBackLink } from "@/components/layout/WorkspaceBackLink";
import { usePlatformSessionsStore } from "@/store/platform-sessions-store";
import { getSessionSummary } from "@/lib/platform/agent-snapshots";
import type { PlatformAgentSlug } from "@/types/platform-session";
import { AGENT_SLUG_LABELS } from "@/types/platform-session";

interface WorkspaceToolbarProps {
  agentSlug: PlatformAgentSlug;
  backSlug: string;
  backLabel: string;
  title: string;
  subtitle: string;
  onClear: () => void;
  clearDisabled?: boolean;
  isGenerating?: boolean;
  hasWork?: boolean;
  llmEnabled?: boolean | null;
  lastMode?: string | null;
  children?: ReactNode;
}

export function WorkspaceToolbar({
  agentSlug,
  backSlug,
  backLabel,
  title,
  subtitle,
  onClear,
  clearDisabled,
  isGenerating,
  hasWork,
  llmEnabled,
  lastMode,
  children,
}: WorkspaceToolbarProps) {
  return (
    <div className="toolbar-strip">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)]"
            >
              <Home className="h-3 w-3" />
              Platform
            </Link>
            <span className="text-[var(--text-muted)]">/</span>
            <WorkspaceBackLink slug={backSlug} label={backLabel} />
          </div>
          <h1 className="text-lg font-semibold text-gradient">{title}</h1>
          <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {llmEnabled !== null && llmEnabled !== undefined && (
            <span className={llmEnabled ? "badge-mode-llm" : "badge-mode-template"}>
              {llmEnabled ? "LLM mode" : "Template mode"}
            </span>
          )}
          {lastMode && (
            <span className="text-xs px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)]">
              Last: {lastMode}
            </span>
          )}
          <SavedSessionsMenu agentSlug={agentSlug} />
          <button
            type="button"
            onClick={onClear}
            disabled={isGenerating || clearDisabled || !hasWork}
            className="btn-secondary"
            title="Clear all options and restart this agent"
          >
            <RotateCcw className="h-4 w-4" />
            Clear & restart
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

function SavedSessionsMenu({ agentSlug }: { agentSlug: PlatformAgentSlug }) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const savedSessions = usePlatformSessionsStore((s) => s.savedSessions) ?? [];
  const activeSessionId = usePlatformSessionsStore((s) => s.activeSessionId);
  const createSession = usePlatformSessionsStore((s) => s.createSession);
  const saveToActiveSession = usePlatformSessionsStore((s) => s.saveToActiveSession);
  const saveToSession = usePlatformSessionsStore((s) => s.saveToSession);
  const deleteSession = usePlatformSessionsStore((s) => s.deleteSession);
  const setActiveSession = usePlatformSessionsStore((s) => s.setActiveSession);

  const active = savedSessions.find((s) => s.id === activeSessionId);

  function handleSaveCurrent() {
    const id = saveToActiveSession(agentSlug);
    if (id) {
      alert(`Saved ${AGENT_SLUG_LABELS[agentSlug]} output to "${savedSessions.find((s) => s.id === id)?.name ?? "session"}".`);
    }
    setOpen(false);
  }

  function handleCreateAndSave() {
    const name = newName.trim() || `Session ${savedSessions.length + 1}`;
    const id = createSession(name);
    saveToSession(id, agentSlug);
    setNewName("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="btn-secondary text-xs"
      >
        <FolderOpen className="h-3.5 w-3.5" />
        {active ? active.name.slice(0, 24) : "Saved sessions"}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-80 section-card shadow-xl p-3">
            <p className="text-xs font-semibold text-[var(--text)] mb-2">Saved engagement sessions</p>
            <p className="text-[10px] text-[var(--text-muted)] mb-3">
              Save work here and optionally load upstream outputs in later agents.
            </p>

            <div className="flex gap-2 mb-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New session name…"
                className="field-input text-xs flex-1"
              />
              <button type="button" onClick={handleCreateAndSave} className="btn-primary text-xs shrink-0 py-1.5">
                <BookmarkPlus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button type="button" onClick={handleSaveCurrent} className="btn-secondary w-full justify-center text-xs mb-3">
              Save current {AGENT_SLUG_LABELS[agentSlug]} to {active ? "active session" : "new session"}
            </button>

            <div className="max-h-48 overflow-y-auto space-y-1.5">
              {savedSessions.length === 0 && (
                <p className="text-xs text-[var(--text-muted)] italic py-2">No saved sessions yet.</p>
              )}
              {savedSessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-start justify-between gap-2 rounded border p-2 text-xs ${
                    session.id === activeSessionId
                      ? "border-[var(--accent)] bg-[var(--accent)]/5"
                      : "border-[var(--border)]"
                  }`}
                >
                  <button
                    type="button"
                    className="text-left flex-1 min-w-0"
                    onClick={() => {
                      setActiveSession(session.id);
                      setOpen(false);
                    }}
                  >
                    <p className="font-medium text-[var(--text)] truncate">{session.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">
                      {getSessionSummary(session)}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {new Date(session.updatedAt).toLocaleString()}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSession(session.id)}
                    className="shrink-0 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-[var(--text-muted)] hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>

            {active && (
              <button
                type="button"
                onClick={() => setActiveSession(null)}
                className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text)] mt-2 w-full text-center"
              >
                Clear active session (start unattached)
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
