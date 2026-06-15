"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectStore } from "@/store/project-store";

export function LegacyWorkspaceRedirect() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const projects = useProjectStore((s) => s.projects);

  useEffect(() => {
    const projectId = activeProjectId ?? projects[0]?.id;
    if (projectId) {
      router.replace(`/projects/${projectId}/agents/${slug}`);
    } else {
      router.replace("/projects/new");
    }
  }, [activeProjectId, projects, router, slug]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-[var(--text-muted)]">
      Redirecting to project workspace…
    </div>
  );
}
