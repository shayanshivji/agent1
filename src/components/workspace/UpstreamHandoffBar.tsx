"use client";

import { useState } from "react";
import { Link2, Link2Off, X } from "lucide-react";
import { usePlatformSessionsStore } from "@/store/platform-sessions-store";
import { useGuideStore } from "@/store/guide-store";
import {
  applyUpstreamForAgent,
  applyScopingToInterview,
  getSessionSummary,
} from "@/lib/platform/agent-snapshots";
import {
  AGENT_SLUG_LABELS,
  UPSTREAM_AGENT,
  UPSTREAM_DECLINED_NONE,
  type PlatformAgentSlug,
} from "@/types/platform-session";

interface UpstreamHandoffBarProps {
  agentSlug: PlatformAgentSlug;
  onApplied?: () => void;
}

export function UpstreamHandoffBar({ agentSlug, onApplied }: UpstreamHandoffBarProps) {
  const [dismissed, setDismissed] = useState(false);
  const savedSessions = usePlatformSessionsStore((s) => s.savedSessions) ?? [];
  const activeSessionId = usePlatformSessionsStore((s) => s.activeSessionId);
  const setActiveSession = usePlatformSessionsStore((s) => s.setActiveSession);
  const declineUpstream = usePlatformSessionsStore((s) => s.declineUpstream);
  const clearDeclinedUpstream = usePlatformSessionsStore((s) => s.clearDeclinedUpstream);
  const isUpstreamDeclined = usePlatformSessionsStore((s) => s.isUpstreamDeclined);

  const liveScopingGuide = useGuideStore((s) => s.guide);
  const liveScopingCompanyName = useGuideStore((s) => s.companyName);
  const liveScopingIndustryId = useGuideStore((s) => s.industryId);
  const liveScopingFunctionId = useGuideStore((s) => s.functionId);
  const liveScopingWorkflowId = useGuideStore((s) => s.workflowId);
  const liveScopingRoleId = useGuideStore((s) => s.roleId);
  const liveScopingLevel = useGuideStore((s) => s.level);
  const liveScopingCustomNotes = useGuideStore((s) => s.customNotes);

  const upstreamSlug = UPSTREAM_AGENT[agentSlug];
  if (!upstreamSlug || dismissed) return null;

  const active = savedSessions.find((s) => s.id === activeSessionId);
  const sessionsWithUpstream = savedSessions.filter((s) => s.outputs?.[upstreamSlug]);
  const hasLiveScoping = upstreamSlug === "scoping" && liveScopingGuide;

  const hasActiveUpstream = active?.outputs?.[upstreamSlug];
  const declined = isUpstreamDeclined(agentSlug);

  if (!hasActiveUpstream && sessionsWithUpstream.length === 0 && !hasLiveScoping) return null;
  if (declined && !hasActiveUpstream && !hasLiveScoping) return null;

  const upstreamLabel = AGENT_SLUG_LABELS[upstreamSlug];

  function handleUse(sessionId: string) {
    const session = savedSessions.find((s) => s.id === sessionId);
    if (!session) return;
    setActiveSession(sessionId);
    clearDeclinedUpstream(agentSlug);
    applyUpstreamForAgent(agentSlug, session);
    onApplied?.();
    setDismissed(true);
  }

  function handleSkip() {
    declineUpstream(agentSlug, activeSessionId ?? UPSTREAM_DECLINED_NONE);
    setDismissed(true);
  }

  function handleUseLiveScoping() {
    if (!liveScopingGuide) return;
    clearDeclinedUpstream(agentSlug);
    applyScopingToInterview({
      savedAt: new Date().toISOString(),
      companyName: liveScopingCompanyName,
      industryId: liveScopingIndustryId,
      functionId: liveScopingFunctionId,
      workflowId: liveScopingWorkflowId,
      roleId: liveScopingRoleId,
      level: liveScopingLevel,
      customNotes: liveScopingCustomNotes,
      guide: liveScopingGuide,
    });
    onApplied?.();
    setDismissed(true);
  }

  return (
    <div className="mb-4 section-card p-4 border-l-4 border-l-[var(--accent)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
            <Link2 className="h-4 w-4 text-[var(--accent)]" />
            Upstream data available from {upstreamLabel}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Load a saved session&apos;s {upstreamLabel.toLowerCase()} output into this agent, or start without it.
          </p>
        </div>
        <button type="button" onClick={() => setDismissed(true)} className="text-[var(--text-muted)] hover:text-[var(--text)]">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {hasLiveScoping && agentSlug === "live-interview" && (
          <button type="button" onClick={handleUseLiveScoping} className="btn-primary text-xs">
            <Link2 className="h-3.5 w-3.5" />
            Use latest Scoping guide (current browser session)
          </button>
        )}
        {hasActiveUpstream && active && (
          <button type="button" onClick={() => handleUse(active.id)} className="btn-primary text-xs">
            <Link2 className="h-3.5 w-3.5" />
            Use active session: {active.name}
          </button>
        )}
        {sessionsWithUpstream
          .filter((s) => s.id !== activeSessionId)
          .slice(0, 3)
          .map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => handleUse(session.id)}
              className="btn-secondary text-xs"
            >
              Use: {session.name}
            </button>
          ))}
        <button type="button" onClick={handleSkip} className="btn-secondary text-xs">
          <Link2Off className="h-3.5 w-3.5" />
          Start without upstream
        </button>
      </div>

      {hasActiveUpstream && active && (
        <p className="text-[10px] text-[var(--text-muted)] mt-2">
          {getSessionSummary(active)}
        </p>
      )}
    </div>
  );
}
