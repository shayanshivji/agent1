"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore, flushProjectSave } from "@/store/project-store";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { AgentWorkflowRail } from "@/components/project/AgentWorkflowRail";
import { FeedbackPanel } from "@/components/project/FeedbackPanel";
import type { PlatformAgentSlug } from "@/types/platform-session";

interface ProjectShellProps {
  projectId: string;
  activeAgentSlug?: PlatformAgentSlug | null;
  children: React.ReactNode;
}

export function ProjectShell({ projectId, activeAgentSlug, children }: ProjectShellProps) {
  const router = useRouter();
  const projects = useProjectStore((s) => s.projects);
  const openProject = useProjectStore((s) => s.openProject);
  const saveActiveProject = useProjectStore((s) => s.saveActiveProject);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);

  const project = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (!project) {
      router.replace("/projects");
      return;
    }
    if (activeProjectId !== projectId) {
      openProject(projectId);
    }
  }, [project, projectId, activeProjectId, openProject, router]);

  useEffect(() => {
    const interval = setInterval(() => flushProjectSave(), 45000);
    return () => {
      clearInterval(interval);
      saveActiveProject();
    };
  }, [projectId, saveActiveProject]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[var(--text-muted)]">
        Loading project…
      </div>
    );
  }

  return (
    <div className="project-shell min-h-screen flex flex-col">
      <ProjectHeader project={project} />
      <div className="project-shell-body flex flex-1 min-h-0">
        <Suspense fallback={<div className="agent-workflow-rail" />}>
          <AgentWorkflowRail projectId={projectId} project={project} />
        </Suspense>
        <main className="project-main flex-1 min-w-0 overflow-y-auto">{children}</main>
        <FeedbackPanel activeAgentSlug={activeAgentSlug} />
      </div>
    </div>
  );
}
