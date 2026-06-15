"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { PipelineDocument, PainPoint, ProcessStep } from "@/types/pipeline";
import type {
  ImprovementInitiative,
  InitiativeInventory,
  InitiativeLifecycle,
  InitiativeViewFilter,
  InputMode,
  LeverType,
} from "@/types/initiative";
import { BSN_PRESET, type EngagementContext } from "@/data/engagement-context";
import {
  INITIATIVE_DEFAULTS,
  buildInventoryFromResponse,
} from "@/lib/initiatives/logic";
import { resolveWorkflows } from "@/data/catalog";

interface InitiativeStore extends EngagementContext {
  workflowId: string;
  inputMode: InputMode;
  viewFilter: InitiativeViewFilter;
  customNotes: string;
  pipelinePayload: string;
  processMapText: string;
  sources: PipelineDocument[];
  processSteps: ProcessStep[];
  painPoints: PainPoint[];
  inventory: InitiativeInventory | null;
  isGenerating: boolean;
  error: string | null;
  lastGenerationMode: "llm" | "template" | null;
  sidePanel: "pain" | "process" | "mapping" | "horizon";

  setCompanyName: (v: string) => void;
  setIndustryId: (v: string) => void;
  setFunctionId: (v: string) => void;
  setWorkflowId: (v: string) => void;
  setInputMode: (v: InputMode) => void;
  setViewFilter: (v: InitiativeViewFilter) => void;
  setCustomNotes: (v: string) => void;
  setPipelinePayload: (v: string) => void;
  setProcessMapText: (v: string) => void;
  setSidePanel: (v: InitiativeStore["sidePanel"]) => void;
  addSource: (doc: PipelineDocument) => void;
  removeSource: (id: string) => void;
  setInventory: (inv: InitiativeInventory | null) => void;
  setProcessSteps: (steps: ProcessStep[]) => void;
  setPainPoints: (points: PainPoint[]) => void;
  setGenerating: (v: boolean) => void;
  setError: (e: string | null) => void;
  setLastGenerationMode: (m: "llm" | "template" | null) => void;
  updateInitiative: (id: string, patch: Partial<ImprovementInitiative>) => void;
  setInitiativeLifecycle: (id: string, lifecycle: InitiativeLifecycle) => void;
  reorderInitiative: (id: string, direction: "up" | "down") => void;
  getContext: () => EngagementContext;
  reset: () => void;
}

export const useInitiativeStore = create<InitiativeStore>()(
  persist(
    (set, get) => ({
      ...INITIATIVE_DEFAULTS,
      sources: [],
      processSteps: [],
      painPoints: [],
      inventory: null,
      isGenerating: false,
      error: null,
      lastGenerationMode: null,
      sidePanel: "pain",

      getContext: () => {
        const { companyName, industryId, functionId } = get();
        return { companyName, industryId, functionId };
      },

      setCompanyName: (companyName) => set({ companyName, inventory: null }),
      setIndustryId: (industryId) => {
        const ctx = { ...get(), industryId };
        const workflows = resolveWorkflows(ctx);
        set({
          industryId,
          workflowId: workflows[0]?.id ?? get().workflowId,
          inventory: null,
        });
      },
      setFunctionId: (functionId) => {
        const ctx = { ...get(), functionId };
        const workflows = resolveWorkflows(ctx);
        set({
          functionId,
          workflowId: workflows[0]?.id ?? get().workflowId,
          inventory: null,
        });
      },
      setWorkflowId: (workflowId) => set({ workflowId, inventory: null }),
      setInputMode: (inputMode) => set({ inputMode, inventory: null }),
      setViewFilter: (viewFilter) => set({ viewFilter }),
      setCustomNotes: (customNotes) => set({ customNotes }),
      setPipelinePayload: (pipelinePayload) => set({ pipelinePayload, inventory: null }),
      setProcessMapText: (processMapText) => set({ processMapText, inventory: null }),
      setSidePanel: (sidePanel) => set({ sidePanel }),

      addSource: (doc) =>
        set((s) => ({ sources: [...s.sources, doc], inventory: null })),
      removeSource: (id) =>
        set((s) => ({
          sources: s.sources.filter((d) => d.id !== id),
          inventory: null,
        })),

      setInventory: (inventory) => set({ inventory, error: null }),
      setProcessSteps: (processSteps) => set({ processSteps }),
      setPainPoints: (painPoints) => set({ painPoints }),
      setGenerating: (isGenerating) => set({ isGenerating }),
      setError: (error) => set({ error }),
      setLastGenerationMode: (lastGenerationMode) => set({ lastGenerationMode }),

      updateInitiative: (id, patch) =>
        set((s) => {
          if (!s.inventory) return s;
          return {
            inventory: {
              ...s.inventory,
              updatedAt: new Date().toISOString(),
              initiatives: s.inventory.initiatives.map((i) =>
                i.id === id ? { ...i, ...patch } : i,
              ),
            },
          };
        }),

      setInitiativeLifecycle: (id, lifecycle) =>
        get().updateInitiative(id, { lifecycle }),

      reorderInitiative: (id, direction) =>
        set((s) => {
          if (!s.inventory) return s;
          const list = [...s.inventory.initiatives].sort((a, b) => a.order - b.order);
          const idx = list.findIndex((i) => i.id === id);
          if (idx < 0) return s;
          const swap = direction === "up" ? idx - 1 : idx + 1;
          if (swap < 0 || swap >= list.length) return s;
          const a = list[idx];
          const b = list[swap];
          list[idx] = { ...b, order: a.order };
          list[swap] = { ...a, order: b.order };
          return {
            inventory: {
              ...s.inventory,
              initiatives: list,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      reset: () =>
        set({
          ...INITIATIVE_DEFAULTS,
          sources: [],
          processSteps: [],
          painPoints: [],
          inventory: null,
          isGenerating: false,
          error: null,
          lastGenerationMode: null,
          sidePanel: "pain",
        }),
    }),
    { name: "improvement-initiatives-agent" },
  ),
);

export { buildInventoryFromResponse };
