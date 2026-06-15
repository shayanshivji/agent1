import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegacyWorkspaceRedirect } from "@/components/project/LegacyWorkspaceRedirect";
import { getAgentBySlug } from "@/data/agent-roster";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);
  if (!agent) return { title: "Workspace | PE Growth Diagnostic" };
  return {
    title: `${agent.shortName} Workspace | PE Growth Diagnostic`,
    description: `Run ${agent.name}`,
  };
}

export default async function AgentWorkspacePage({ params }: PageProps) {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);

  if (!agent || agent.status !== "live") {
    notFound();
  }

  return <LegacyWorkspaceRedirect />;
}
