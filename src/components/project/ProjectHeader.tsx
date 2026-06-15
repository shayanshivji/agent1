"use client";

import Link from "next/link";
import { Home, Save } from "lucide-react";
import type { StudyProject } from "@/types/project";
import { useProjectStore, flushProjectSave } from "@/store/project-store";

const STATUS_LABELS: Record<StudyProject["status"], string> = {
  discovery: "Discovery",
  diagnosis: "Diagnosis",
  sizing: "Value sizing",
  roadmap: "Roadmapping",
  complete: "Complete",
};

interface ProjectHeaderProps {
  project: StudyProject;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <header className="project-header">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] mb-1">
            <Link href="/" className="hover:text-[var(--accent)] inline-flex items-center gap-1">
              <Home className="h-3 w-3" />
              Home
            </Link>
            <span>/</span>
            <Link href="/projects" className="hover:text-[var(--accent)]">
              Projects
            </Link>
          </div>
          <h1 className="text-lg font-semibold text-[var(--text)] truncate">{project.name}</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {project.clientName} · Last updated {new Date(project.updatedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="project-status-badge">{STATUS_LABELS[project.status]}</span>
          <div className="project-progress-wrap">
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1">
              <span>{project.studyStage}</span>
              <span>{project.progress}%</span>
            </div>
            <div className="project-progress-bar">
              <div className="project-progress-fill" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              flushProjectSave();
              useProjectStore.getState().saveActiveProject();
            }}
            className="btn-secondary text-xs"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
        </div>
      </div>
    </header>
  );
}
