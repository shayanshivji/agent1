"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProjectShell } from "@/components/project/ProjectShell";
import { ExecutiveSummaryDashboard } from "@/components/project/ExecutiveSummaryDashboard";
import { PlannedAgentPlaceholder } from "@/components/project/PlannedAgentPlaceholder";
import { useProjectStore, flushProjectSave } from "@/store/project-store";

interface ProjectDashboardPageProps {
  projectId: string;
}

export function ProjectDashboardPage({ projectId }: ProjectDashboardPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = searchParams.get("step");
  const projects = useProjectStore((s) => s.projects);
  const project = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (!project) router.replace("/projects");
  }, [project, router]);

  useEffect(() => {
    flushProjectSave();
  }, [projectId]);

  if (!project) return null;

  if (step) {
    return (
      <ProjectShell projectId={projectId}>
        <PlannedAgentPlaceholder stepId={step} projectId={projectId} />
      </ProjectShell>
    );
  }

  return (
    <ProjectShell projectId={projectId}>
      <div className="px-6 py-8">
        <ExecutiveSummaryDashboard project={project} />
      </div>
    </ProjectShell>
  );
}
