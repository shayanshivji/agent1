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
import { GUIDE_TRANSIENT, omitTransient } from "@/lib/store/persist-config";

interface GuideStore extends EngagementContext {
  workflowId: string;
  workflowIds: string[];
  roleId: string;
  level: InterviewLevel;
  customNotes: string;
  interviewObjective: string;
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
  setWorkflowIds: (ids: string[]) => void;
  toggleWorkflowId: (id: string) => void;
  setRoleId: (id: string) => void;
  setLevel: (level: InterviewLevel) => void;
  setCustomNotes: (notes: string) => void;
  setInterviewObjective: (objective: string) => void;
  addSource: (doc: SourceDocument) => void;
  removeSource: (id: string) => void;
  setGuide: (guide: InterviewGuide | null) => void;
  setGenerating: (v: boolean) => void;
  setError: (e: string | null) => void;
  setLastGenerationMode: (mode: "llm" | "template" | null) => void;
  updateSection: (sectionId: GuideSectionId, content: string, bullets?: string[]) => void;
  updateQuestion: (sectionId: GuideSectionId, index: number, text: string) => void;
  addQuestion: (sectionId: GuideSectionId, text?: string) => void;
  removeQuestion: (sectionId: GuideSectionId, index: number) => void;
  replaceGuideSections: (
    sections: { id: GuideSectionId; title: string; content?: string; bullets?: string[] }[],
  ) => void;
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
  workflowIds: ["mts-shop-build"],
  roleId: "mts-pod",
  level: "deep_dive" as InterviewLevel,
  customNotes: "",
  interviewObjective: "",
  sources: [] as SourceDocument[],
  guide: null as InterviewGuide | null,
  versions: [] as VersionHistoryEntry[],
  isGenerating: false,
  error: null as string | null,
  lastGenerationMode: null as "llm" | "template" | null,
};

function resetSelectionsForContext(
  ctx: EngagementContext,
  workflowIds: string[],
  roleId: string,
) {
  const workflows = resolveWorkflows(ctx);
  const roles = resolveRoles(ctx);
  const validIds = workflowIds.filter((id) => workflows.some((w) => w.id === id));
  const nextWorkflowIds =
    validIds.length > 0 ? validIds : [pickDefaultWorkflowId(ctx)];
  const nextRole = roles.some((r) => r.id === roleId)
    ? roleId
    : pickDefaultRoleId(ctx);
  return { workflowIds: nextWorkflowIds, workflowId: nextWorkflowIds[0], roleId: nextRole };
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
          const { workflowIds, workflowId, roleId } = resetSelectionsForContext(
            ctx,
            s.workflowIds.length ? s.workflowIds : [s.workflowId],
            s.roleId,
          );
          return { industryId, workflowIds, workflowId, roleId, guide: null };
        }),

      setFunctionId: (functionId) =>
        set((s) => {
          const ctx = { ...s, functionId };
          const { workflowIds, workflowId, roleId } = resetSelectionsForContext(
            ctx,
            s.workflowIds.length ? s.workflowIds : [s.workflowId],
            s.roleId,
          );
          return { functionId, workflowIds, workflowId, roleId, guide: null };
        }),

      setWorkflowId: (id) => set({ workflowId: id, workflowIds: [id], guide: null }),
      setWorkflowIds: (ids) => {
        if (!ids.length) return;
        set({ workflowIds: ids, workflowId: ids[0], guide: null });
      },
      toggleWorkflowId: (id) =>
        set((s) => {
          const current = s.workflowIds.length ? s.workflowIds : [s.workflowId];
          let next: string[];
          if (current.includes(id)) {
            if (current.length === 1) return s;
            next = current.filter((x) => x !== id);
          } else {
            next = [...current, id];
          }
          return { workflowIds: next, workflowId: next[0], guide: null };
        }),
      setRoleId: (id) => set({ roleId: id, guide: null }),
      setLevel: (level) => set({ level, guide: null }),
      setCustomNotes: (notes) => set({ customNotes: notes, guide: null }),
      setInterviewObjective: (objective) => set({ interviewObjective: objective, guide: null }),

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

      updateQuestion: (sectionId, index, text) =>
        set((s) => {
          if (!s.guide) return s;
          return {
            guide: {
              ...s.guide,
              updatedAt: new Date().toISOString(),
              sections: s.guide.sections.map((sec) => {
                if (sec.id !== sectionId) return sec;
                const bullets = [...(sec.bullets ?? [])];
                bullets[index] = text;
                return { ...sec, bullets };
              }),
            },
          };
        }),

      addQuestion: (sectionId, text = "") =>
        set((s) => {
          if (!s.guide) return s;
          return {
            guide: {
              ...s.guide,
              updatedAt: new Date().toISOString(),
              sections: s.guide.sections.map((sec) =>
                sec.id === sectionId
                  ? { ...sec, bullets: [...(sec.bullets ?? []), text] }
                  : sec,
              ),
            },
          };
        }),

      removeQuestion: (sectionId, index) =>
        set((s) => {
          if (!s.guide) return s;
          return {
            guide: {
              ...s.guide,
              updatedAt: new Date().toISOString(),
              sections: s.guide.sections.map((sec) => {
                if (sec.id !== sectionId) return sec;
                const bullets = (sec.bullets ?? []).filter((_, i) => i !== index);
                return { ...sec, bullets: bullets.length ? bullets : undefined };
              }),
            },
          };
        }),

      replaceGuideSections: (sections) =>
        set((s) => {
          if (!s.guide) return s;
          const byId = new Map(sections.map((sec) => [sec.id, sec]));
          return {
            guide: {
              ...s.guide,
              updatedAt: new Date().toISOString(),
              sections: s.guide.sections.map((sec) => {
                const next = byId.get(sec.id);
                if (!next) return sec;
                return {
                  ...sec,
                  title: next.title ?? sec.title,
                  content: next.content ?? "",
                  bullets: next.bullets,
                };
              }),
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
        if (!entry) return;
        const g = entry.guide;
        set({
          guide: g,
          workflowId: g.workflowId,
          workflowIds: g.workflowIds?.length ? g.workflowIds : [g.workflowId],
          roleId: g.roleId,
          level: g.level,
          companyName: g.companyName ?? get().companyName,
          industryId: g.industryId ?? get().industryId,
          functionId: g.functionId ?? get().functionId,
          customNotes: g.customNotes ?? get().customNotes,
          interviewObjective: g.interviewObjective ?? get().interviewObjective,
        });
      },

      reset: () => set({ ...defaults, versions: get().versions }),
    }),
    {
      name: "bsn-interview-guide-agent",
      partialize: (state) => omitTransient(state, [...GUIDE_TRANSIENT]),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.workflowIds?.length) {
          state.workflowIds = [state.workflowId];
        }
      },
    },
  ),
);

export function buildGuideFromResponse(
  workflowIds: string[],
  roleId: string,
  level: InterviewLevel,
  sections: { id: GuideSectionId; title: string; content?: string; bullets?: string[] }[],
  ctx: EngagementContext,
  customNotes?: string,
  interviewObjective?: string,
): InterviewGuide {
  const ids = workflowIds.length ? workflowIds : ["mts-shop-build"];
  const primaryId = ids[0];
  const workflow = getWorkflow(primaryId, ctx);
  const role = getRole(roleId, ctx);
  const names = ids
    .map((id) => getWorkflow(id, ctx)?.name ?? id)
    .filter(Boolean);
  const workflowName =
    names.length > 1 ? names.join(" · ") : (workflow?.name ?? primaryId);
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
    workflowId: primaryId,
    workflowIds: ids,
    workflowName,
    roleId,
    roleName: role?.name ?? roleId,
    level,
    sections: normalized,
    reviewStatus: "draft",
    createdAt: now,
    updatedAt: now,
    customNotes,
    interviewObjective,
    companyName: ctx.companyName,
    industryId: ctx.industryId,
    functionId: ctx.functionId,
  };
}
