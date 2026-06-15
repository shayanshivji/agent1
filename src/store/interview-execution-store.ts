"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { PipelineDocument } from "@/types/pipeline";
import type { InputMode } from "@/types/initiative";
import type {
  InterviewExecutionDocument,
  InterviewExecutionMode,
  InterviewTab,
  InterviewVersionEntry,
  LiveTurn,
  ValidationStatus,
  InterviewPainPoint,
  InterviewWorkflowStep,
  EvidenceRecord,
  GuideQuestionItem,
} from "@/types/interview-execution";
import { BSN_PRESET, type EngagementContext } from "@/data/engagement-context";
import {
  INTERVIEW_DEFAULTS,
  toAgent3Package,
  computeCoverageFromTurns,
  parseGuidePayload,
} from "@/lib/interview-execution/logic";
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
      setRoleId: (roleId) => set({ roleId, document: null }),
      setMode: (mode) =>
        set((s) =>
          s.mode === mode
            ? { mode }
            : {
                mode,
                document: null,
                liveTurns: [],
                transcriptText: "",
                liveDraft: "",
              },
        ),
      setInputMode: (inputMode) => set({ inputMode, document: null }),
      setStakeholderName: (stakeholderName) => set({ stakeholderName }),
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
      setTranscriptText: (transcriptText) => set({ transcriptText }),
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

      setDocument: (document) => set({ document, error: null }),
      setGenerating: (isGenerating) => set({ isGenerating }),
      setSuggesting: (isSuggesting) => set({ isSuggesting }),
      setError: (error) => set({ error }),
      setLastGenerationMode: (lastGenerationMode) => set({ lastGenerationMode }),

      setReviewStatus: (reviewStatus) =>
        set((s) => {
          if (!s.document) return s;
          return {
            document: { ...s.document, reviewStatus, updatedAt: new Date().toISOString() },
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

        set({
          liveTurns,
          liveDraft: "",
          pendingGuideQuestionId: state.liveSpeaker === "interviewer" ? null : state.pendingGuideQuestionId,
          guideQuestions,
          document: state.document
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
                    status: q.status === "answered" ? "covered" : q.status === "asked" ? "partial" : "missing",
                    linkedQuestion: q.text,
                  })),
                  missingTopics: guideQuestions.filter((q) => q.status === "pending").map((q) => q.text.slice(0, 60)),
                },
                updatedAt: new Date().toISOString(),
              }
            : state.document,
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

          return {
            liveTurns,
            guideQuestions,
            document: s.document
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
                      status:
                        q.status === "answered"
                          ? "covered"
                          : q.status === "asked"
                            ? "partial"
                            : "missing",
                      linkedQuestion: q.text,
                    })),
                    missingTopics: guideQuestions
                      .filter((q) => q.status === "pending")
                      .map((q) => q.text.slice(0, 60)),
                  },
                  updatedAt: new Date().toISOString(),
                }
              : s.document,
          };
        }),

      updatePainPoint: (id, patch) =>
        set((s) => {
          if (!s.document) return s;
          return {
            document: {
              ...s.document,
              updatedAt: new Date().toISOString(),
              painPoints: s.document.painPoints.map((p) =>
                p.id === id ? { ...p, ...patch } : p,
              ),
            },
          };
        }),

      updateWorkflowStep: (id, patch) =>
        set((s) => {
          if (!s.document) return s;
          return {
            document: {
              ...s.document,
              updatedAt: new Date().toISOString(),
              workflowSteps: s.document.workflowSteps.map((step) =>
                step.id === id ? { ...step, ...patch } : step,
              ),
            },
          };
        }),

      updateEvidence: (id, patch) =>
        set((s) => {
          if (!s.document) return s;
          return {
            document: {
              ...s.document,
              updatedAt: new Date().toISOString(),
              evidenceRegistry: s.document.evidenceRegistry.map((e) =>
                e.id === id ? { ...e, ...patch } : e,
              ),
            },
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
        const entry = get().versions.find((v) => v.id === versionId);
        if (entry) set({ document: entry.snapshot });
      },

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
    },
  ),
);
