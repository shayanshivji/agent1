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
} from "@/types/interview-execution";
import { BSN_PRESET, type EngagementContext } from "@/data/engagement-context";
import {
  INTERVIEW_DEFAULTS,
  toAgent3Package,
  computeCoverageFromTurns,
  parseGuidePayload,
} from "@/lib/interview-execution/logic";
import { pickDefaultRoleId, resolveWorkflows } from "@/data/catalog";

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
  setSuggestedFollowUps: (f: string[]) => void;
  addSource: (doc: PipelineDocument) => void;
  removeSource: (id: string) => void;
  setDocument: (doc: InterviewExecutionDocument | null) => void;
  setGenerating: (v: boolean) => void;
  setSuggesting: (v: boolean) => void;
  setError: (e: string | null) => void;
  setLastGenerationMode: (m: "llm" | "template" | null) => void;
  setReviewStatus: (s: ValidationStatus) => void;
  addLiveTurn: (content: string) => void;
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
      setMode: (mode) => set({ mode, document: null }),
      setInputMode: (inputMode) => set({ inputMode, document: null }),
      setStakeholderName: (stakeholderName) => set({ stakeholderName }),
      setCustomNotes: (customNotes) => set({ customNotes }),
      setGuidePayload: (guidePayload) => set({ guidePayload, document: null }),
      setTranscriptText: (transcriptText) => set({ transcriptText }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setLiveDraft: (liveDraft) => set({ liveDraft }),
      setLiveSpeaker: (liveSpeaker) => set({ liveSpeaker }),
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

      addLiveTurn: (content) => {
        const turn: LiveTurn = {
          id: uuidv4(),
          speaker: get().liveSpeaker,
          content,
          timestamp: new Date().toISOString(),
        };
        const liveTurns = [...get().liveTurns, turn];
        const guide = parseGuidePayload(get().guidePayload);
        const { score, questionsAsked } = computeCoverageFromTurns(liveTurns, guide);
        set((s) => ({
          liveTurns,
          liveDraft: "",
          document: s.document
            ? {
                ...s.document,
                liveTurns,
                coverage: {
                  ...s.document.coverage,
                  score,
                  questionsAsked,
                },
                updatedAt: new Date().toISOString(),
              }
            : s.document,
        }));
      },

      removeLiveTurn: (id) =>
        set((s) => ({
          liveTurns: s.liveTurns.filter((t) => t.id !== id),
        })),

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
          suggestedFollowUps: [],
          isGenerating: false,
          isSuggesting: false,
          error: null,
          lastGenerationMode: null,
        }),
    }),
    { name: "live-interview-agent" },
  ),
);
