"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { CreateProjectInput, FeedbackEntry, StudyProject } from "@/types/project";
import { BSN_PRESET } from "@/data/engagement-context";
import {
  captureAllAgentOutputs,
  clearAllAgentStores,
  computeProjectProgress,
  inferProjectStatus,
  inferStudyStage,
  restoreProjectIntoStores,
} from "@/lib/platform/project-persistence";

interface ProjectStore {
  projects: StudyProject[];
  activeProjectId: string | null;
  /** Pending feedback action for the active agent workspace */
  pendingFeedbackAction: FeedbackEntry | null;

  createProject: (input: CreateProjectInput) => string;
  openProject: (id: string) => void;
  saveActiveProject: () => void;
  deleteProject: (id: string) => void;
  updateProjectMeta: (id: string, patch: Partial<Pick<StudyProject, "name" | "clientName" | "notes" | "status">>) => void;
  getActiveProject: () => StudyProject | null;
  addFeedback: (entry: Omit<FeedbackEntry, "id" | "createdAt">) => void;
  clearPendingFeedback: () => void;
  setPendingFeedback: (entry: FeedbackEntry | null) => void;
}

function buildProject(input: CreateProjectInput): StudyProject {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: input.name.trim() || "Untitled study",
    clientName: input.clientName.trim() || BSN_PRESET.companyName,
    status: "discovery",
    studyStage: "Project setup",
    progress: 0,
    createdAt: now,
    updatedAt: now,
    industryId: input.industryId ?? BSN_PRESET.industryId,
    functionId: input.functionId ?? BSN_PRESET.functionId,
    workflowId: input.workflowId ?? "mts-shop-build",
    notes: "",
    outputs: {},
    sourceFiles: [],
    feedbackLog: [],
  };
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      pendingFeedbackAction: null,

      createProject: (input) => {
        const project = buildProject(input);
        clearAllAgentStores();
        set((s) => ({
          projects: [project, ...s.projects],
          activeProjectId: project.id,
        }));
        return project.id;
      },

      openProject: (id) => {
        const { activeProjectId, projects } = get();
        if (activeProjectId && activeProjectId !== id) {
          get().saveActiveProject();
        }
        const project = projects.find((p) => p.id === id);
        if (!project) return;
        clearAllAgentStores();
        restoreProjectIntoStores(project);
        set({ activeProjectId: id, pendingFeedbackAction: null });
      },

      saveActiveProject: () => {
        const { activeProjectId, projects } = get();
        if (!activeProjectId) return;
        const outputs = captureAllAgentOutputs();
        const progress = computeProjectProgress(outputs);
        const studyStage = inferStudyStage(outputs);
        const status = inferProjectStatus(progress, outputs);
        const scoping = outputs.scoping;

        set({
          projects: projects.map((p) => {
            if (p.id !== activeProjectId) return p;
            return {
              ...p,
              updatedAt: new Date().toISOString(),
              outputs,
              progress,
              studyStage,
              status,
              clientName: scoping?.companyName ?? p.clientName,
              industryId: scoping?.industryId ?? p.industryId,
              functionId: scoping?.functionId ?? p.functionId,
              workflowId: scoping?.workflowId ?? outputs["live-interview"]?.workflowId ?? p.workflowId,
            };
          }),
        });
      },

      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
        })),

      updateProjectMeta: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
          ),
        })),

      getActiveProject: () => {
        const { activeProjectId, projects } = get();
        if (!activeProjectId) return null;
        return projects.find((p) => p.id === activeProjectId) ?? null;
      },

      addFeedback: (entry) => {
        const { activeProjectId } = get();
        if (!activeProjectId) return;
        const full: FeedbackEntry = {
          ...entry,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === activeProjectId
              ? { ...p, feedbackLog: [...p.feedbackLog, full], updatedAt: full.createdAt }
              : p,
          ),
          pendingFeedbackAction:
            entry.action === "regenerate" || entry.action === "correction" ? full : s.pendingFeedbackAction,
        }));
      },

      clearPendingFeedback: () => set({ pendingFeedbackAction: null }),
      setPendingFeedback: (pendingFeedbackAction) => set({ pendingFeedbackAction }),
    }),
    {
      name: "pe-diagnostic-projects",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ProjectStore>;
        return {
          ...current,
          ...p,
          projects: Array.isArray(p.projects) ? p.projects : [],
          activeProjectId: typeof p.activeProjectId === "string" ? p.activeProjectId : null,
        };
      },
    },
  ),
);

/** Auto-save active project outputs (call on navigation / interval). */
export function flushProjectSave() {
  useProjectStore.getState().saveActiveProject();
}
