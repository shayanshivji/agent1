"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type {
  GuideSectionId,
  InterviewGuide,
  InterviewLevel,
  ReviewStatus,
  SourceDocument,
  VersionHistoryEntry,
} from "@/types/guide";
import { GUIDE_SECTIONS } from "@/types/guide";
import {
  getRole,
  getWorkflow,
  pickDefaultRoleId,
  pickDefaultWorkflowId,
  resolveRoles,
  resolveWorkflows,
} from "@/data/catalog";
import { BSN_PRESET, type EngagementContext } from "@/data/engagement-context";

interface GuideStore extends EngagementContext {
  workflowId: string;
  roleId: string;
  level: InterviewLevel;
  customNotes: string;
  sources: SourceDocument[];
  guide: InterviewGuide | null;
  versions: VersionHistoryEntry[];
  isGenerating: boolean;
  error: string | null;
  lastGenerationMode: "llm" | "template" | null;

  setCompanyName: (name: string) => void;
  setIndustryId: (id: string) => void;
  setFunctionId: (id: string) => void;
  setWorkflowId: (id: string) => void;
  setRoleId: (id: string) => void;
  setLevel: (level: InterviewLevel) => void;
  setCustomNotes: (notes: string) => void;
  addSource: (doc: SourceDocument) => void;
  removeSource: (id: string) => void;
  setGuide: (guide: InterviewGuide | null) => void;
  setGenerating: (v: boolean) => void;
  setError: (e: string | null) => void;
  setLastGenerationMode: (mode: "llm" | "template" | null) => void;
  updateSection: (sectionId: GuideSectionId, content: string, bullets?: string[]) => void;
  setReviewStatus: (status: ReviewStatus) => void;
  saveVersion: (label?: string) => void;
  loadVersion: (versionId: string) => void;
  reset: () => void;
  getContext: () => EngagementContext;
}

const defaults = {
  companyName: BSN_PRESET.companyName,
  industryId: BSN_PRESET.industryId,
  functionId: BSN_PRESET.functionId,
  workflowId: "mts-shop-build",
  roleId: "mts-pod",
  level: "deep_dive" as InterviewLevel,
  customNotes: "",
  sources: [] as SourceDocument[],
  guide: null as InterviewGuide | null,
  versions: [] as VersionHistoryEntry[],
  isGenerating: false,
  error: null as string | null,
  lastGenerationMode: null as "llm" | "template" | null,
};

function resetSelectionsForContext(
  ctx: EngagementContext,
  workflowId: string,
  roleId: string,
) {
  const workflows = resolveWorkflows(ctx);
  const roles = resolveRoles(ctx);
  const nextWorkflow = workflows.some((w) => w.id === workflowId)
    ? workflowId
    : pickDefaultWorkflowId(ctx);
  const nextRole = roles.some((r) => r.id === roleId)
    ? roleId
    : pickDefaultRoleId(ctx);
  return { workflowId: nextWorkflow, roleId: nextRole };
}

export const useGuideStore = create<GuideStore>()(
  persist(
    (set, get) => ({
      ...defaults,

      getContext: () => {
        const { companyName, industryId, functionId } = get();
        return { companyName, industryId, functionId };
      },

      setCompanyName: (companyName) => set({ companyName, guide: null }),

      setIndustryId: (industryId) =>
        set((s) => {
          const ctx = { ...s, industryId };
          const { workflowId, roleId } = resetSelectionsForContext(
            ctx,
            s.workflowId,
            s.roleId,
          );
          return { industryId, workflowId, roleId, guide: null };
        }),

      setFunctionId: (functionId) =>
        set((s) => {
          const ctx = { ...s, functionId };
          const { workflowId, roleId } = resetSelectionsForContext(
            ctx,
            s.workflowId,
            s.roleId,
          );
          return { functionId, workflowId, roleId, guide: null };
        }),

      setWorkflowId: (id) => set({ workflowId: id, guide: null }),
      setRoleId: (id) => set({ roleId: id, guide: null }),
      setLevel: (level) => set({ level }),
      setCustomNotes: (notes) => set({ customNotes: notes }),

      addSource: (doc) =>
        set((s) => ({ sources: [...s.sources, doc], guide: null })),

      removeSource: (id) =>
        set((s) => ({
          sources: s.sources.filter((d) => d.id !== id),
          guide: null,
        })),

      setGuide: (guide) => set({ guide, error: null }),

      setGenerating: (isGenerating) => set({ isGenerating }),
      setError: (error) => set({ error }),
      setLastGenerationMode: (lastGenerationMode) => set({ lastGenerationMode }),

      updateSection: (sectionId, content, bullets) =>
        set((s) => {
          if (!s.guide) return s;
          return {
            guide: {
              ...s.guide,
              updatedAt: new Date().toISOString(),
              sections: s.guide.sections.map((sec) =>
                sec.id === sectionId ? { ...sec, content, bullets } : sec,
              ),
            },
          };
        }),

      setReviewStatus: (reviewStatus) =>
        set((s) =>
          s.guide
            ? { guide: { ...s.guide, reviewStatus, updatedAt: new Date().toISOString() } }
            : s,
        ),

      saveVersion: (label) => {
        const { guide, versions } = get();
        if (!guide) return;
        const entry: VersionHistoryEntry = {
          id: uuidv4(),
          guideId: guide.id,
          label: label ?? `Saved ${new Date().toLocaleString()}`,
          savedAt: new Date().toISOString(),
          guide: JSON.parse(JSON.stringify(guide)),
        };
        set({ versions: [entry, ...versions].slice(0, 20) });
      },

      loadVersion: (versionId) => {
        const entry = get().versions.find((v) => v.id === versionId);
        if (entry) set({ guide: entry.guide });
      },

      reset: () => set({ ...defaults, versions: get().versions }),
    }),
    { name: "bsn-interview-guide-agent" },
  ),
);

export function buildGuideFromResponse(
  workflowId: string,
  roleId: string,
  level: InterviewLevel,
  sections: { id: GuideSectionId; title: string; content?: string; bullets?: string[] }[],
  ctx: EngagementContext,
  customNotes?: string,
): InterviewGuide {
  const workflow = getWorkflow(workflowId, ctx);
  const role = getRole(roleId, ctx);
  const now = new Date().toISOString();

  const normalized = GUIDE_SECTIONS.map((def) => {
    const fromApi = sections.find((s) => s.id === def.id);
    return {
      id: def.id,
      title: def.title,
      content: fromApi?.content ?? "",
      bullets: fromApi?.bullets,
    };
  });

  return {
    id: uuidv4(),
    workflowId,
    workflowName: workflow?.name ?? workflowId,
    roleId,
    roleName: role?.name ?? roleId,
    level,
    sections: normalized,
    reviewStatus: "draft",
    createdAt: now,
    updatedAt: now,
    customNotes,
    companyName: ctx.companyName,
    industryId: ctx.industryId,
    functionId: ctx.functionId,
  };
}
