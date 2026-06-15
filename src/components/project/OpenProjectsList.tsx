"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useProjectStore } from "@/store/project-store";
import { DEMO_PROJECT_ID, isDemoProject } from "@/data/demo-project-seed";
import { OpenDemoProjectCard } from "@/components/project/OpenDemoProjectCard";

export function OpenProjectsList() {
  const projects = useProjectStore((s) => s.projects);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const ensureDemoProject = useProjectStore((s) => s.ensureDemoProject);

  useEffect(() => {
    ensureDemoProject();
  }, [ensureDemoProject]);

  const demo = projects.find((p) => p.id === DEMO_PROJECT_ID);
  const others = projects.filter((p) => p.id !== DEMO_PROJECT_ID);

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

      <div className="mb-8">
        <OpenDemoProjectCard />
      </div>

      {others.length === 0 && !demo ? (
        <div className="section-card p-12 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-4">No other saved projects yet.</p>
          <Link href="/projects/new" className="btn-primary text-sm">
            Start new project
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {demo && (
            <div className="section-card p-4 flex items-center gap-4 border-l-4 border-l-[var(--accent)]">
              <Link href={`/projects/${demo.id}`} className="flex-1 min-w-0 group">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[var(--text)] group-hover:text-[var(--accent)] truncate">
                    {demo.name}
                  </p>
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[var(--accent)]/30 text-[var(--accent)] bg-[var(--accent-soft)]">
                    Demo
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {demo.clientName} · {demo.studyStage} · {demo.progress}% complete
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  All 4 agent outputs pre-loaded · Updated{" "}
                  {new Date(demo.updatedAt).toLocaleString()}
                </p>
              </Link>
              <Link href={`/projects/${demo.id}`} className="btn-primary text-xs shrink-0">
                Open
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {others.map((p) => (
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
              {!isDemoProject(p.id) && (
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
