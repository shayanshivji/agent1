import { ProjectShell } from "@/components/project/ProjectShell";
import { ProjectAgentHost, isLiveAgentSlug } from "@/components/project/ProjectAgentHost";
import { notFound } from "next/navigation";
import type { PlatformAgentSlug } from "@/types/platform-session";

interface PageProps {
  params: Promise<{ projectId: string; slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProjectAgentPage({ params, searchParams }: PageProps) {
  const { projectId, slug } = await params;
  const { tab } = await searchParams;

  if (!isLiveAgentSlug(slug)) {
    notFound();
  }

  return (
    <ProjectShell projectId={projectId} activeAgentSlug={slug as PlatformAgentSlug}>
      <ProjectAgentHost slug={slug} initialTab={tab} />
    </ProjectShell>
  );
}
