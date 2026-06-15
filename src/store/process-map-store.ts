"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PipelineDocument } from "@/types/pipeline";
import type { InputMode } from "@/types/initiative";
import type {
  MapImprovement,
  MapPainPoint,
  MapProcessStep,
  ProcessMapDocument,
  ProcessMapTab,
  RefineTarget,
  RefinementRecord,
} from "@/types/process-map";
import { BSN_PRESET, type EngagementContext } from "@/data/engagement-context";
import {
  PROCESS_MAP_DEFAULTS,
  buildProcessMapFromResponse,
  toPipelineHandoff,
} from "@/lib/process-map/logic";
import { resolveWorkflows } from "@/data/catalog";

interface ProcessMapStore extends EngagementContext {
  workflowId: string;
  inputMode: InputMode;
  customNotes: string;
  pipelinePayload: string;
  pastedNotes: string;
  sources: PipelineDocument[];
  document: ProcessMapDocument | null;
  activeTab: ProcessMapTab;
  selectedStepId: string | null;
  selectedPhaseId: string | null;
  isGenerating: boolean;
  isRefining: boolean;
  error: string | null;
  lastGenerationMode: "llm" | "template" | null;

  setCompanyName: (v: string) => void;
  setIndustryId: (v: string) => void;
  setFunctionId: (v: string) => void;
  setWorkflowId: (v: string) => void;
  setInputMode: (v: InputMode) => void;
  setCustomNotes: (v: string) => void;
  setPipelinePayload: (v: string) => void;
  setPastedNotes: (v: string) => void;
  setActiveTab: (t: ProcessMapTab) => void;
  setSelectedStepId: (id: string | null) => void;
  setSelectedPhaseId: (id: string | null) => void;
  addSource: (doc: PipelineDocument) => void;
  removeSource: (id: string) => void;
  setDocument: (doc: ProcessMapDocument | null) => void;
  setGenerating: (v: boolean) => void;
  setRefining: (v: boolean) => void;
  setError: (e: string | null) => void;
  setLastGenerationMode: (m: "llm" | "template" | null) => void;
  updateStep: (id: string, patch: Partial<MapProcessStep>) => void;
  updatePainPoint: (id: string, patch: Partial<MapPainPoint>) => void;
  updateImprovement: (id: string, patch: Partial<MapImprovement>) => void;
  addRefinement: (r: RefinementRecord) => void;
  getContext: () => EngagementContext;
  getPipelineHandoff: () => string;
  reset: () => void;
}

export const useProcessMapStore = create<ProcessMapStore>()(
  persist(
    (set, get) => ({
      ...BSN_PRESET,
      ...PROCESS_MAP_DEFAULTS,
      sources: [],
      document: null,
      activeTab: "summary",
      selectedStepId: null,
      selectedPhaseId: null,
      isGenerating: false,
      isRefining: false,
      error: null,
      lastGenerationMode: null,

      getContext: () => {
        const { companyName, industryId, functionId } = get();
        return { companyName, industryId, functionId };
      },

      getPipelineHandoff: () => {
        const doc = get().document;
        if (!doc) return "{}";
        return JSON.stringify(toPipelineHandoff(doc), null, 2);
      },

      setCompanyName: (companyName) => set({ companyName, document: null }),
      setIndustryId: (industryId) => {
        const ctx = { ...get(), industryId };
        const workflows = resolveWorkflows(ctx);
        set({
          industryId,
          workflowId: workflows[0]?.id ?? get().workflowId,
          document: null,
        });
      },
      setFunctionId: (functionId) => {
        const ctx = { ...get(), functionId };
        const workflows = resolveWorkflows(ctx);
        set({
          functionId,
          workflowId: workflows[0]?.id ?? get().workflowId,
          document: null,
        });
      },
      setWorkflowId: (workflowId) => set({ workflowId, document: null }),
      setInputMode: (inputMode) => set({ inputMode, document: null }),
      setCustomNotes: (customNotes) => set({ customNotes }),
      setPipelinePayload: (pipelinePayload) => set({ pipelinePayload, document: null }),
      setPastedNotes: (pastedNotes) => set({ pastedNotes }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setSelectedStepId: (selectedStepId) => set({ selectedStepId }),
      setSelectedPhaseId: (selectedPhaseId) => set({ selectedPhaseId }),

      addSource: (doc) =>
        set((s) => ({ sources: [...s.sources, doc], document: null })),
      removeSource: (id) =>
        set((s) => ({
          sources: s.sources.filter((d) => d.id !== id),
          document: null,
        })),

      setDocument: (document) => set({ document, error: null }),
      setGenerating: (isGenerating) => set({ isGenerating }),
      setRefining: (isRefining) => set({ isRefining }),
      setError: (error) => set({ error }),
      setLastGenerationMode: (lastGenerationMode) => set({ lastGenerationMode }),

      updateStep: (id, patch) =>
        set((s) => {
          if (!s.document) return s;
          return {
            document: {
              ...s.document,
              updatedAt: new Date().toISOString(),
              steps: s.document.steps.map((step) =>
                step.id === id ? { ...step, ...patch } : step,
              ),
            },
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

      updateImprovement: (id, patch) =>
        set((s) => {
          if (!s.document) return s;
          return {
            document: {
              ...s.document,
              updatedAt: new Date().toISOString(),
              improvements: s.document.improvements.map((imp) =>
                imp.id === id ? { ...imp, ...patch } : imp,
              ),
            },
          };
        }),

      addRefinement: (r) =>
        set((s) => {
          if (!s.document) return s;
          return {
            document: {
              ...s.document,
              refinements: [...s.document.refinements, r],
            },
          };
        }),

      reset: () =>
        set({
          ...PROCESS_MAP_DEFAULTS,
          companyName: BSN_PRESET.companyName,
          industryId: BSN_PRESET.industryId,
          functionId: BSN_PRESET.functionId,
          sources: [],
          document: null,
          activeTab: "summary",
          selectedStepId: null,
          selectedPhaseId: null,
          isGenerating: false,
          isRefining: false,
          error: null,
          lastGenerationMode: null,
        }),
    }),
    { name: "process-mapping-agent" },
  ),
);

export { buildProcessMapFromResponse };
