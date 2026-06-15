import { Suspense } from "react";
import { ProjectDashboardPage } from "@/components/project/ProjectDashboardPage";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { projectId } = await params;
  return (
    <Suspense fallback={<div className="p-8 text-sm text-[var(--text-muted)]">Loading…</div>}>
      <ProjectDashboardPage projectId={projectId} />
    </Suspense>
  );
}
