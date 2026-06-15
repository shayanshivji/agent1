"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WORKFLOW_STEPS, workflowHref } from "@/data/workflow-pipeline";
import { getOutputSummaries } from "@/lib/platform/project-persistence";
import type { StudyProject } from "@/types/project";
import { OutputCard } from "@/components/project/OutputCard";

interface ExecutiveSummaryDashboardProps {
  project: StudyProject;
}

export function ExecutiveSummaryDashboard({ project }: ExecutiveSummaryDashboardProps) {
  const summaries = getOutputSummaries(project);
  const nextStep = WORKFLOW_STEPS.find(
    (s) => s.status === "live" && s.agentSlug && !summaries.find((x) => x.id === s.id)?.ready,
  );

  return (
    <div className="executive-summary">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-wider text-[var(--accent)] mb-2">
          Executive summary
        </p>
        <h2 className="text-2xl font-semibold text-[var(--text)]">{project.name}</h2>
        <p className="text-sm text-[var(--text-muted)] mt-2 max-w-2xl leading-relaxed">
          High-level view of diagnostic progress for {project.clientName}. This dashboard is suitable
          for leadership review — open any agent step for the full fact base and editable outputs.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="exec-metric">
          <p className="exec-metric-label">Progress</p>
          <p className="exec-metric-value">{project.progress}%</p>
        </div>
        <div className="exec-metric">
          <p className="exec-metric-label">Study stage</p>
          <p className="exec-metric-value text-base">{project.studyStage}</p>
        </div>
        <div className="exec-metric">
          <p className="exec-metric-label">Outputs ready</p>
          <p className="exec-metric-value">
            {summaries.filter((s) => s.ready).length}/{summaries.length}
          </p>
        </div>
        <div className="exec-metric">
          <p className="exec-metric-label">Feedback items</p>
          <p className="exec-metric-value">{project.feedbackLog.length}</p>
        </div>
      </div>

      <section className="mb-10">
        <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Key outputs</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {summaries.map((s) => (
            <OutputCard
              key={s.id}
              title={s.title}
              detail={s.detail}
              ready={s.ready}
              updatedAt={s.updatedAt}
              href={`/projects/${project.id}/agents/${s.id}`}
            />
          ))}
        </div>
      </section>

      {nextStep && (
        <section className="section-card p-6 border-l-4 border-l-[var(--accent)]">
          <p className="text-xs font-semibold text-[var(--accent)] mb-1">Suggested next step</p>
          <p className="text-sm text-[var(--text)]">{nextStep.label}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1 mb-4">{nextStep.description}</p>
          <Link href={workflowHref(project.id, nextStep)} className="btn-primary text-xs">
            Continue workflow
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      )}

      {project.notes && (
        <section className="mt-8 section-card p-4">
          <p className="text-xs font-semibold text-[var(--text)] mb-2">Project notes</p>
          <p className="text-sm text-[var(--text-muted)] whitespace-pre-wrap">{project.notes}</p>
        </section>
      )}
    </div>
  );
}
