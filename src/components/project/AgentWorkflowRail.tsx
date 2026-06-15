"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CheckCircle2, Circle, LayoutDashboard, Lock } from "lucide-react";
import { WORKFLOW_STEPS, workflowHref } from "@/data/workflow-pipeline";
import type { StudyProject } from "@/types/project";
import type { PlatformAgentSlug } from "@/types/platform-session";

interface AgentWorkflowRailProps {
  projectId: string;
  project: StudyProject;
}

function stepComplete(project: StudyProject, agentSlug: PlatformAgentSlug | null): boolean {
  if (!agentSlug) return false;
  const out = project.outputs[agentSlug];
  if (!out) return false;
  if (agentSlug === "scoping") return Boolean(project.outputs.scoping?.guide);
  if ("document" in out) return Boolean(out.document);
  return false;
}

function isStepActive(
  step: (typeof WORKFLOW_STEPS)[number],
  pathname: string,
  tab: string | null,
  href: string,
): boolean {
  if (step.id === "pain-synthesis") {
    return pathname.includes("/agents/process-mapping") && tab === "pain";
  }
  if (step.id === "process-mapping") {
    return pathname.includes("/agents/process-mapping") && tab !== "pain";
  }
  if (step.agentSlug) {
    return pathname.includes(`/agents/${step.agentSlug}`);
  }
  return pathname === href || pathname.startsWith(`${href}?`);
}

export function AgentWorkflowRail({ projectId, project }: AgentWorkflowRailProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const plannedStep = searchParams.get("step");
  const execSummaryHref = `/projects/${projectId}`;
  const isExecSummaryActive =
    pathname === execSummaryHref && !plannedStep;

  return (
    <nav className="agent-workflow-rail" aria-label="Diagnostic workflow">
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] px-3 mb-3">
        Overview
      </p>
      <Link
        href={execSummaryHref}
        className={`workflow-rail-item mb-4 ${isExecSummaryActive ? "workflow-rail-item-active" : ""}`}
      >
        <LayoutDashboard className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
        <div className="min-w-0">
          <p className="text-xs font-medium truncate">Executive summary</p>
          <p className="text-[10px] text-[var(--text-muted)] truncate">Progress & key outputs</p>
        </div>
      </Link>

      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] px-3 mb-3 border-t border-[var(--border)] pt-4">
        Workflow
      </p>
      <ol className="space-y-1">
        {WORKFLOW_STEPS.map((step) => {
          const href = workflowHref(projectId, step);
          const isActive = isStepActive(step, pathname, tab, href);
          const done = step.agentSlug ? stepComplete(project, step.agentSlug) : false;
          const planned = step.status === "planned";

          return (
            <li key={step.id}>
              {planned ? (
                <div className="workflow-rail-item workflow-rail-item-planned">
                  <Lock className="h-3.5 w-3.5 shrink-0 opacity-50" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate opacity-60">{step.shortLabel}</p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate opacity-50">
                      Coming soon
                    </p>
                  </div>
                </div>
              ) : (
                <Link
                  href={href}
                  className={`workflow-rail-item ${isActive ? "workflow-rail-item-active" : ""}`}
                >
                  {done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--success)]" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{step.shortLabel}</p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{step.label}</p>
                  </div>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
