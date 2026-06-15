"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { PipelineDocument } from "@/types/pipeline";
import type { InputMode } from "@/types/initiative";
import type {
  InterviewExecutionDocument,
  InterviewExecutionMode,
  InterviewRun,
  InterviewTab,
  InterviewVersionEntry,
  LiveTurn,
  ValidationStatus,
  InterviewPainPoint,
  InterviewWorkflowStep,
  EvidenceRecord,
  GuideQuestionItem,
  CoverageStatus,
} from "@/types/interview-execution";
import { BSN_PRESET, type EngagementContext } from "@/data/engagement-context";
import {
  INTERVIEW_DEFAULTS,
  toAgent3Package,
  computeCoverageFromTurns,
  parseGuidePayload,
} from "@/lib/interview-execution/logic";
import {
  applyRunToFlat,
  ensureRuns,
  flushActiveRun,
  withActiveRunPatch,
} from "@/lib/interview-execution/runs";
import {
  computeGuideCoverage,
  extractQuestionsFromGuide,
  guideToHandoffPayload,
  syncQuestionStatusFromTurns,
} from "@/lib/pipeline/guide-handoff";
import { pickDefaultRoleId, resolveWorkflows } from "@/data/catalog";
import { INTERVIEW_TRANSIENT, omitTransient } from "@/lib/store/persist-config";

interface InterviewStore extends EngagementContext {
  workflowId: string;
  roleId: string;
  mode: InterviewExecutionMode;
  inputMode: InputMode;
  stakeholderName: string;
  customNotes: string;
  guidePayload: string;
  transcriptText: string;
  sources: PipelineDocument[];
  document: InterviewExecutionDocument | null;
  versions: InterviewVersionEntry[];
  activeTab: InterviewTab;
  liveTurns: LiveTurn[];
  liveDraft: string;
  liveSpeaker: "interviewer" | "interviewee";
  guideQuestions: GuideQuestionItem[];
  linkedGuideId: string | null;
  linkedGuideUpdatedAt: string | null;
  guideSource: "scoping" | "manual" | null;
  pendingGuideQuestionId: string | null;
  suggestedFollowUps: string[];
  isGenerating: boolean;
  isSuggesting: boolean;
  error: string | null;
  lastGenerationMode: "llm" | "template" | null;
  interviewRuns: InterviewRun[];
  activeRunId: string | null;

  setCompanyName: (v: string) => void;
  setIndustryId: (v: string) => void;
  setFunctionId: (v: string) => void;
  setWorkflowId: (v: string) => void;
  setRoleId: (v: string) => void;
  setMode: (m: InterviewExecutionMode) => void;
  setInputMode: (m: InputMode) => void;
  setStakeholderName: (v: string) => void;
  setCustomNotes: (v: string) => void;
  setGuidePayload: (v: string) => void;
  setTranscriptText: (v: string) => void;
  setActiveTab: (t: InterviewTab) => void;
  setLiveDraft: (v: string) => void;
  setLiveSpeaker: (s: "interviewer" | "interviewee") => void;
  setPendingGuideQuestionId: (id: string | null) => void;
  askGuideQuestion: (questionId: string) => void;
  importGuideFromScoping: (force?: boolean) => boolean;
  setSuggestedFollowUps: (f: string[]) => void;
  addSource: (doc: PipelineDocument) => void;
  removeSource: (id: string) => void;
  setDocument: (doc: InterviewExecutionDocument | null) => void;
  setGenerating: (v: boolean) => void;
  setSuggesting: (v: boolean) => void;
  setError: (e: string | null) => void;
  setLastGenerationMode: (m: "llm" | "template" | null) => void;
  setReviewStatus: (s: ValidationStatus) => void;
  addLiveTurn: (content: string, guideQuestionId?: string) => void;
  removeLiveTurn: (id: string) => void;
  updatePainPoint: (id: string, patch: Partial<InterviewPainPoint>) => void;
  updateWorkflowStep: (id: string, patch: Partial<InterviewWorkflowStep>) => void;
  updateEvidence: (id: string, patch: Partial<EvidenceRecord>) => void;
  saveVersion: (label?: string) => void;
  loadVersion: (versionId: string) => void;
  createInterview: () => void;
  switchInterview: (runId: string) => void;
  deleteInterview: (runId: string) => void;
  renameInterview: (runId: string, label: string) => void;
  getContext: () => EngagementContext;
  getAgent3Package: () => string;
  reset: () => void;
}

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set, get) => ({
      ...BSN_PRESET,
      ...INTERVIEW_DEFAULTS,
      sources: [],
      document: null,
      versions: [],
      activeTab: "summary",
      liveTurns: [],
      liveDraft: "",
      liveSpeaker: "interviewer",
      guideQuestions: [],
      linkedGuideId: null,
      linkedGuideUpdatedAt: null,
      guideSource: null,
      pendingGuideQuestionId: null,
      suggestedFollowUps: [],
      isGenerating: false,
      isSuggesting: false,
      error: null,
      lastGenerationMode: null,
      interviewRuns: [],
      activeRunId: null,

      getContext: () => {
        const { companyName, industryId, functionId } = get();
        return { companyName, industryId, functionId };
      },

      getAgent3Package: () => {
        const doc = get().document;
        if (!doc) return "{}";
        return JSON.stringify(toAgent3Package(doc), null, 2);
      },

      setCompanyName: (companyName) => set({ companyName, document: null }),
      setIndustryId: (industryId) => {
        const ctx = { ...get(), industryId };
        const workflows = resolveWorkflows(ctx);
        set({
          industryId,
          workflowId: workflows[0]?.id ?? get().workflowId,
          roleId: pickDefaultRoleId(ctx),
          document: null,
        });
      },
      setFunctionId: (functionId) => {
        const ctx = { ...get(), functionId };
        const workflows = resolveWorkflows(ctx);
        set({
          functionId,
          workflowId: workflows[0]?.id ?? get().workflowId,
          roleId: pickDefaultRoleId(ctx),
          document: null,
        });
      },
      setWorkflowId: (workflowId) => {
        set({ workflowId, document: null });
      },
      setRoleId: (roleId) =>
        set((s) => ({
          roleId,
          document: null,
          ...withActiveRunPatch({ ...s, roleId, document: null }, { roleId, document: null }),
        })),
      setMode: (mode) =>
        set((s) => {
          if (s.mode === mode) return { mode };
          const patch = {
            mode,
            document: null,
            liveTurns: [] as LiveTurn[],
            transcriptText: "",
            liveDraft: "",
          };
          return { ...patch, ...withActiveRunPatch({ ...s, ...patch }, patch) };
        }),
      setInputMode: (inputMode) => set({ inputMode, document: null }),
      setStakeholderName: (stakeholderName) =>
        set((s) => ({
          stakeholderName,
          ...withActiveRunPatch({ ...s, stakeholderName }, { stakeholderName }),
        })),
      setCustomNotes: (customNotes) => set({ customNotes }),
      setGuidePayload: (guidePayload) => {
        const parsed = parseGuidePayload(guidePayload);
        if (parsed) {
          set({
            guidePayload,
            document: null,
            guideQuestions: extractQuestionsFromGuide(parsed),
            linkedGuideId: parsed.id,
            linkedGuideUpdatedAt: parsed.updatedAt,
            guideSource: "manual",
            inputMode: "pipeline",
          });
        } else if (!guidePayload.trim()) {
          set({
            guidePayload: "",
            document: null,
            guideQuestions: [],
            linkedGuideId: null,
            linkedGuideUpdatedAt: null,
            guideSource: null,
          });
        } else {
          set({ guidePayload, document: null });
        }
      },
      setTranscriptText: (transcriptText) =>
        set((s) => ({
          transcriptText,
          ...withActiveRunPatch({ ...s, transcriptText }, { transcriptText }),
        })),
      setActiveTab: (activeTab) => set({ activeTab }),
      setLiveDraft: (liveDraft) => set({ liveDraft }),
      setLiveSpeaker: (liveSpeaker) => set({ liveSpeaker }),
      setPendingGuideQuestionId: (pendingGuideQuestionId) => set({ pendingGuideQuestionId }),

      askGuideQuestion: (questionId) => {
        const q = get().guideQuestions.find((item) => item.id === questionId);
        if (!q) return;
        set({
          pendingGuideQuestionId: questionId,
          liveSpeaker: "interviewer",
          liveDraft: q.text,
        });
      },

      importGuideFromScoping: (force = false) => {
        // Lazy import avoids circular dependency with guide-store at module init.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const scoping = require("@/store/guide-store").useGuideStore.getState();
        const guide = scoping.guide;
        if (!guide) return false;
        const syncedAt = get().linkedGuideUpdatedAt;
        if (
          !force &&
          get().linkedGuideId === guide.id &&
          get().guideQuestions.length > 0 &&
          syncedAt === guide.updatedAt
        ) {
          return true;
        }

        const questions = extractQuestionsFromGuide(guide);
        set({
          guidePayload: guideToHandoffPayload(guide),
          guideQuestions: questions,
          linkedGuideId: guide.id,
          linkedGuideUpdatedAt: guide.updatedAt,
          guideSource: "scoping",
          inputMode: "pipeline",
          workflowId: guide.workflowId,
          roleId: guide.roleId,
          companyName: guide.companyName ?? scoping.companyName,
          industryId: guide.industryId ?? scoping.industryId,
          functionId: guide.functionId ?? scoping.functionId,
          customNotes: guide.customNotes ?? scoping.customNotes,
        });
        return true;
      },

      setSuggestedFollowUps: (suggestedFollowUps) => set({ suggestedFollowUps }),

      addSource: (doc) => set((s) => ({ sources: [...s.sources, doc], document: null })),
      removeSource: (id) =>
        set((s) => ({ sources: s.sources.filter((d) => d.id !== id), document: null })),

      setDocument: (document) =>
        set((s) => ({
          document,
          error: null,
          ...withActiveRunPatch({ ...s, document }, { document }),
        })),
      setGenerating: (isGenerating) => set({ isGenerating }),
      setSuggesting: (isSuggesting) => set({ isSuggesting }),
      setError: (error) => set({ error }),
      setLastGenerationMode: (lastGenerationMode) => set({ lastGenerationMode }),

      setReviewStatus: (reviewStatus) =>
        set((s) => {
          if (!s.document) return s;
          const nextDocument = { ...s.document, reviewStatus, updatedAt: new Date().toISOString() };
          return {
            document: nextDocument,
            ...withActiveRunPatch({ ...s, document: nextDocument }, { document: nextDocument }),
          };
        }),

      addLiveTurn: (content, guideQuestionId) => {
        const state = get();
        const qId = guideQuestionId ?? state.pendingGuideQuestionId ?? undefined;
        const turn: LiveTurn = {
          id: uuidv4(),
          speaker: state.liveSpeaker,
          content,
          timestamp: new Date().toISOString(),
          guideQuestionId: state.liveSpeaker === "interviewer" ? qId : undefined,
        };

        const liveTurns = [...state.liveTurns, turn];
        let guideQuestions = syncQuestionStatusFromTurns(state.guideQuestions, liveTurns);

        if (state.liveSpeaker === "interviewer" && qId) {
          guideQuestions = guideQuestions.map((q) =>
            q.id === qId ? { ...q, status: "asked" as const, linkedTurnIds: [...(q.linkedTurnIds ?? []), turn.id] } : q,
          );
        }

        if (state.liveSpeaker === "interviewee") {
          const lastInterviewer = [...liveTurns].reverse().find((t) => t.speaker === "interviewer");
          if (lastInterviewer?.guideQuestionId) {
            guideQuestions = guideQuestions.map((q) =>
              q.id === lastInterviewer.guideQuestionId
                ? { ...q, status: "answered" as const, linkedTurnIds: [...(q.linkedTurnIds ?? []), turn.id] }
                : q,
            );
          }
        }

        const guide = parseGuidePayload(state.guidePayload);
        const fallback = computeCoverageFromTurns(liveTurns, guide);
        const score = guideQuestions.length
          ? computeGuideCoverage(guideQuestions)
          : fallback.score;
        const questionsAsked = guideQuestions.length
          ? guideQuestions.filter((q) => q.status !== "pending").map((q) => q.text)
          : fallback.questionsAsked;

        const topicStatus = (status: GuideQuestionItem["status"]): CoverageStatus =>
          status === "answered" ? "covered" : status === "asked" ? "partial" : "missing";

        const nextDocument: InterviewExecutionDocument | null = state.document
          ? {
              ...state.document,
              liveTurns,
              coverage: {
                ...state.document.coverage,
                score,
                questionsAsked,
                topics: guideQuestions.map((q) => ({
                  id: q.id,
                  name: q.text.slice(0, 80),
                  status: topicStatus(q.status),
                  linkedQuestion: q.text,
                })),
                missingTopics: guideQuestions.filter((q) => q.status === "pending").map((q) => q.text.slice(0, 60)),
              },
              updatedAt: new Date().toISOString(),
            }
          : state.document;

        set({
          liveTurns,
          liveDraft: "",
          pendingGuideQuestionId: state.liveSpeaker === "interviewer" ? null : state.pendingGuideQuestionId,
          guideQuestions,
          document: nextDocument,
          ...withActiveRunPatch(
            { ...state, liveTurns, guideQuestions, document: nextDocument },
            { liveTurns, guideQuestions, document: nextDocument },
          ),
        });
      },

      removeLiveTurn: (id) =>
        set((s) => {
          const liveTurns = s.liveTurns.filter((t) => t.id !== id);
          const guideQuestions = syncQuestionStatusFromTurns(s.guideQuestions, liveTurns);
          const guide = parseGuidePayload(s.guidePayload);
          const fallback = computeCoverageFromTurns(liveTurns, guide);
          const score = guideQuestions.length
            ? computeGuideCoverage(guideQuestions)
            : fallback.score;
          const questionsAsked = guideQuestions.length
            ? guideQuestions.filter((q) => q.status !== "pending").map((q) => q.text)
            : fallback.questionsAsked;

          const topicStatus = (status: GuideQuestionItem["status"]): CoverageStatus =>
            status === "answered" ? "covered" : status === "asked" ? "partial" : "missing";

          const nextDocument: InterviewExecutionDocument | null = s.document
            ? {
                ...s.document,
                liveTurns,
                coverage: {
                  ...s.document.coverage,
                  score,
                  questionsAsked,
                  topics: guideQuestions.map((q) => ({
                    id: q.id,
                    name: q.text.slice(0, 80),
                    status: topicStatus(q.status),
                    linkedQuestion: q.text,
                  })),
                  missingTopics: guideQuestions
                    .filter((q) => q.status === "pending")
                    .map((q) => q.text.slice(0, 60)),
                },
                updatedAt: new Date().toISOString(),
              }
            : s.document;

          return {
            liveTurns,
            guideQuestions,
            document: nextDocument,
            ...withActiveRunPatch(
              { ...s, liveTurns, guideQuestions, document: nextDocument },
              { liveTurns, guideQuestions, document: nextDocument },
            ),
          };
        }),

      updatePainPoint: (id, patch) =>
        set((s) => {
          if (!s.document) return s;
          const nextDocument = {
            ...s.document,
            updatedAt: new Date().toISOString(),
            painPoints: s.document.painPoints.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          };
          return {
            document: nextDocument,
            ...withActiveRunPatch({ ...s, document: nextDocument }, { document: nextDocument }),
          };
        }),

      updateWorkflowStep: (id, patch) =>
        set((s) => {
          if (!s.document) return s;
          const nextDocument = {
            ...s.document,
            updatedAt: new Date().toISOString(),
            workflowSteps: s.document.workflowSteps.map((step) =>
              step.id === id ? { ...step, ...patch } : step,
            ),
          };
          return {
            document: nextDocument,
            ...withActiveRunPatch({ ...s, document: nextDocument }, { document: nextDocument }),
          };
        }),

      updateEvidence: (id, patch) =>
        set((s) => {
          if (!s.document) return s;
          const nextDocument = {
            ...s.document,
            updatedAt: new Date().toISOString(),
            evidenceRegistry: s.document.evidenceRegistry.map((e) =>
              e.id === id ? { ...e, ...patch } : e,
            ),
          };
          return {
            document: nextDocument,
            ...withActiveRunPatch({ ...s, document: nextDocument }, { document: nextDocument }),
          };
        }),

      saveVersion: (label) =>
        set((s) => {
          if (!s.document) return s;
          const entry: InterviewVersionEntry = {
            id: uuidv4(),
            label: label ?? `Version ${s.versions.length + 1}`,
            savedAt: new Date().toISOString(),
            snapshot: s.document,
          };
          return { versions: [...s.versions, entry] };
        }),

      loadVersion: (versionId) => {
        const state = get();
        const entry = state.versions.find((v) => v.id === versionId);
        if (!entry) return;
        set({
          document: entry.snapshot,
          ...withActiveRunPatch({ ...state, document: entry.snapshot }, { document: entry.snapshot }),
        });
      },

      createInterview: () =>
        set((s) => {
          const ensured = ensureRuns(s);
          const flushed = flushActiveRun({ ...s, ...ensured });
          const guide = parseGuidePayload(s.guidePayload);
          const freshQuestions = guide ? extractQuestionsFromGuide(guide) : [];
          const now = new Date().toISOString();
          const newRun: InterviewRun = {
            id: uuidv4(),
            label: `Interview ${flushed.length + 1}`,
            stakeholderName: "",
            roleId: s.roleId,
            mode: s.mode,
            transcriptText: "",
            liveTurns: [],
            document: null,
            guideQuestions: freshQuestions,
            createdAt: now,
            updatedAt: now,
          };
          return {
            ...applyRunToFlat(newRun),
            interviewRuns: [...flushed, newRun],
            activeRunId: newRun.id,
            liveDraft: "",
            liveSpeaker: "interviewer" as const,
            pendingGuideQuestionId: null,
            suggestedFollowUps: [],
            error: null,
          };
        }),

      switchInterview: (runId) =>
        set((s) => {
          const ensured = ensureRuns(s);
          const flushed = flushActiveRun({ ...s, ...ensured });
          const target = flushed.find((r) => r.id === runId);
          if (!target) return {};
          return {
            ...applyRunToFlat(target),
            interviewRuns: flushed,
            activeRunId: runId,
            liveDraft: "",
            liveSpeaker: "interviewer" as const,
            pendingGuideQuestionId: null,
            suggestedFollowUps: [],
            error: null,
          };
        }),

      deleteInterview: (runId) =>
        set((s) => {
          const ensured = ensureRuns(s);
          const flushed = flushActiveRun({ ...s, ...ensured });
          if (flushed.length <= 1) return {};
          const nextRuns = flushed.filter((r) => r.id !== runId);
          if (runId !== s.activeRunId) return { interviewRuns: nextRuns };
          const next = nextRuns[nextRuns.length - 1];
          return {
            ...applyRunToFlat(next),
            interviewRuns: nextRuns,
            activeRunId: next.id,
            liveDraft: "",
            liveSpeaker: "interviewer" as const,
            pendingGuideQuestionId: null,
            suggestedFollowUps: [],
          };
        }),

      renameInterview: (runId, label) =>
        set((s) => ({
          interviewRuns: s.interviewRuns.map((r) =>
            r.id === runId
              ? { ...r, label: label.trim() || r.label, updatedAt: new Date().toISOString() }
              : r,
          ),
        })),

      reset: () =>
        set({
          ...INTERVIEW_DEFAULTS,
          companyName: BSN_PRESET.companyName,
          industryId: BSN_PRESET.industryId,
          functionId: BSN_PRESET.functionId,
          sources: [],
          document: null,
          versions: [],
          activeTab: "summary",
          interviewRuns: [],
          activeRunId: null,
          liveTurns: [],
          liveDraft: "",
          liveSpeaker: "interviewer",
          guideQuestions: [],
          linkedGuideId: null,
          linkedGuideUpdatedAt: null,
          guideSource: null,
          pendingGuideQuestionId: null,
          suggestedFollowUps: [],
          isGenerating: false,
          isSuggesting: false,
          error: null,
          lastGenerationMode: null,
        }),
    }),
    {
      name: "live-interview-agent",
      partialize: (state) => omitTransient(state, [...INTERVIEW_TRANSIENT]),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.interviewRuns.length === 0) {
          const ensured = ensureRuns(state);
          state.interviewRuns = ensured.interviewRuns;
          state.activeRunId = ensured.activeRunId;
        }
      },
    },
  ),
);
