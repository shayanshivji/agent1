"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CheckCircle2, Circle, LayoutDashboard, Lock } from "lucide-react";
import { WORKFLOW_STEPS, workflowHref } from "@/data/workflow-pipeline";
import {
  RailMarqueeLabels,
  RailMarqueeText,
  activateRailLabelsFromItem,
  deactivateRailLabelsFromItem,
} from "@/components/project/RailMarqueeText";
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
  href: string,
): boolean {
  if (step.agentSlug) {
    return pathname.includes(`/agents/${step.agentSlug}`);
  }
  return pathname === href || pathname.startsWith(`${href}?`);
}

function railItemHoverHandlers() {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) =>
      activateRailLabelsFromItem(e.currentTarget),
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) =>
      deactivateRailLabelsFromItem(e.currentTarget),
  };
}

export function AgentWorkflowRail({ projectId, project }: AgentWorkflowRailProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const plannedStep = searchParams.get("step");
  const execSummaryHref = `/projects/${projectId}`;
  const isExecSummaryActive = pathname === execSummaryHref && !plannedStep;
  const hover = railItemHoverHandlers();

  return (
    <nav className="agent-workflow-rail" aria-label="Value creation steps">
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] px-3 mb-3">
        Overview
      </p>
      <Link
        href={execSummaryHref}
        className={`workflow-rail-item mb-4 ${isExecSummaryActive ? "workflow-rail-item-active" : ""}`}
        {...hover}
      >
        <LayoutDashboard className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
        <RailMarqueeLabels>
          <RailMarqueeText text="Executive summary" className="text-xs font-medium" />
          <RailMarqueeText
            text="Progress & key outputs"
            className="text-[10px] text-[var(--text-muted)] mt-0.5"
          />
        </RailMarqueeLabels>
      </Link>

      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] px-3 mb-3 border-t border-[var(--border)] pt-4">
        Value creation steps
      </p>
      <ol className="space-y-1">
        {WORKFLOW_STEPS.map((step) => {
          const href = workflowHref(projectId, step);
          const isActive = isStepActive(step, pathname, href);
          const done = step.agentSlug ? stepComplete(project, step.agentSlug) : false;
          const planned = step.status === "planned";

          return (
            <li key={step.id}>
              {planned ? (
                <div className="workflow-rail-item workflow-rail-item-planned" {...hover}>
                  <Lock className="h-3.5 w-3.5 shrink-0 opacity-50" />
                  <RailMarqueeLabels>
                    <RailMarqueeText text={step.label} className="text-xs font-medium opacity-60" />
                    <RailMarqueeText
                      text={`${step.agentLabel} · Coming soon`}
                      className="text-[10px] text-[var(--text-muted)] opacity-50 mt-0.5"
                    />
                  </RailMarqueeLabels>
                </div>
              ) : (
                <Link
                  href={href}
                  className={`workflow-rail-item ${isActive ? "workflow-rail-item-active" : ""}`}
                  {...hover}
                >
                  {done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--success)]" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                  )}
                  <RailMarqueeLabels>
                    <RailMarqueeText text={step.label} className="text-xs font-medium leading-snug" />
                    <RailMarqueeText
                      text={step.agentLabel}
                      className="text-[10px] text-[var(--text-muted)] mt-0.5"
                    />
                  </RailMarqueeLabels>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
