"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { useProjectStore } from "@/store/project-store";

export function OpenProjectsList() {
  const projects = useProjectStore((s) => s.projects);
  const deleteProject = useProjectStore((s) => s.deleteProject);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to cover
      </Link>

      <h1 className="text-2xl font-semibold text-gradient mb-2">Open existing project</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        Select a saved study to resume. Each project keeps its own outputs and feedback history.
      </p>

      {projects.length === 0 ? (
        <div className="section-card p-12 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-4">No saved projects yet.</p>
          <Link href="/projects/new" className="btn-primary text-sm">
            Start new project
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.id} className="section-card p-4 flex items-center gap-4">
              <Link href={`/projects/${p.id}`} className="flex-1 min-w-0 group">
                <p className="font-semibold text-[var(--text)] group-hover:text-[var(--accent)] truncate">
                  {p.name}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {p.clientName} · {p.studyStage} · {p.progress}% complete
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Updated {new Date(p.updatedAt).toLocaleString()}
                </p>
              </Link>
              <Link href={`/projects/${p.id}`} className="btn-primary text-xs shrink-0">
                Open
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) {
                    deleteProject(p.id);
                  }
                }}
                className="p-2 text-[var(--text-muted)] hover:text-red-400 shrink-0"
                title="Delete project"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
