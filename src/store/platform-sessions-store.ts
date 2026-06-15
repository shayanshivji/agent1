"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { PlatformAgentSlug, SavedEngagement } from "@/types/platform-session";
import { UPSTREAM_DECLINED_NONE } from "@/types/platform-session";

function captureSnapshot(slug: PlatformAgentSlug) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { captureAgentSnapshot } = require("@/lib/platform/agent-snapshots") as typeof import("@/lib/platform/agent-snapshots");
  return captureAgentSnapshot(slug);
}

interface PlatformSessionsStore {
  savedSessions: SavedEngagement[];
  activeSessionId: string | null;
  /** Per-agent: user chose not to use upstream for this session */
  declinedUpstream: Partial<Record<PlatformAgentSlug, string>>;

  createSession: (name: string) => string;
  saveToSession: (sessionId: string, slug: PlatformAgentSlug) => void;
  saveToActiveSession: (slug: PlatformAgentSlug) => string | null;
  deleteSession: (id: string) => void;
  setActiveSession: (id: string | null) => void;
  getActiveSession: () => SavedEngagement | null;
  declineUpstream: (agentSlug: PlatformAgentSlug, sessionId: string) => void;
  clearDeclinedUpstream: (agentSlug: PlatformAgentSlug) => void;
  isUpstreamDeclined: (agentSlug: PlatformAgentSlug) => boolean;
}

export const usePlatformSessionsStore = create<PlatformSessionsStore>()(
  persist(
    (set, get) => ({
      savedSessions: [],
      activeSessionId: null,
      declinedUpstream: {},

      createSession: (name) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        const session: SavedEngagement = {
          id,
          name: name.trim() || `Session ${get().savedSessions.length + 1}`,
          createdAt: now,
          updatedAt: now,
          companyName: "",
          industryId: "",
          functionId: "",
          outputs: {},
        };
        set((s) => ({
          savedSessions: [session, ...s.savedSessions],
          activeSessionId: id,
        }));
        return id;
      },

      saveToSession: (sessionId, slug) => {
        const snapshot = captureSnapshot(slug);
        const scoping = snapshot.scoping;
        set((s) => ({
          savedSessions: s.savedSessions.map((session) => {
            if (session.id !== sessionId) return session;
            const merged = {
              ...session.outputs,
              ...snapshot,
            };
            return {
              ...session,
              updatedAt: new Date().toISOString(),
              companyName: scoping?.companyName ?? session.companyName,
              industryId: scoping?.industryId ?? session.industryId,
              functionId: scoping?.functionId ?? session.functionId,
              workflowId: scoping?.workflowId ?? snapshot["live-interview"]?.workflowId ?? session.workflowId,
              roleId: scoping?.roleId ?? snapshot["live-interview"]?.roleId ?? session.roleId,
              outputs: merged,
            };
          }),
        }));
      },

      saveToActiveSession: (slug) => {
        let { activeSessionId } = get();
        if (!activeSessionId) {
          activeSessionId = get().createSession(`Run ${new Date().toLocaleDateString()}`);
        }
        get().saveToSession(activeSessionId, slug);
        return activeSessionId;
      },

      deleteSession: (id) =>
        set((s) => ({
          savedSessions: s.savedSessions.filter((x) => x.id !== id),
          activeSessionId: s.activeSessionId === id ? null : s.activeSessionId,
        })),

      setActiveSession: (id) => set({ activeSessionId: id }),

      getActiveSession: () => {
        const { activeSessionId, savedSessions } = get();
        if (!activeSessionId) return null;
        return savedSessions.find((s) => s.id === activeSessionId) ?? null;
      },

      declineUpstream: (agentSlug, sessionId) =>
        set((s) => ({
          declinedUpstream: { ...s.declinedUpstream, [agentSlug]: sessionId },
        })),

      clearDeclinedUpstream: (agentSlug) =>
        set((s) => {
          const next = { ...s.declinedUpstream };
          delete next[agentSlug];
          return { declinedUpstream: next };
        }),

      isUpstreamDeclined: (agentSlug) => {
        const { declinedUpstream, activeSessionId } = get();
        const declined = declinedUpstream[agentSlug];
        if (!declined) return false;
        if (declined === UPSTREAM_DECLINED_NONE) return !activeSessionId;
        return Boolean(activeSessionId && declined === activeSessionId);
      },
    }),
    {
      name: "platform-saved-sessions",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PlatformSessionsStore>;
        return {
          ...current,
          ...p,
          savedSessions: Array.isArray(p.savedSessions) ? p.savedSessions : [],
          activeSessionId: typeof p.activeSessionId === "string" ? p.activeSessionId : null,
          declinedUpstream:
            p.declinedUpstream && typeof p.declinedUpstream === "object" ? p.declinedUpstream : {},
        };
      },
    },
  ),
);
