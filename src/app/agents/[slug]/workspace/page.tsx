import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ScopingAgentWorkspace } from "@/components/agents/ScopingAgentWorkspace";
import { InitiativesAgentWorkspace } from "@/components/agents/InitiativesAgentWorkspace";
import { ProcessMappingAgentWorkspace } from "@/components/agents/ProcessMappingAgentWorkspace";
import { LiveInterviewAgentWorkspace } from "@/components/agents/LiveInterviewAgentWorkspace";
import { getAgentBySlug } from "@/data/agent-roster";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const WORKSPACES: Record<string, ComponentType> = {
  scoping: ScopingAgentWorkspace,
  "live-interview": LiveInterviewAgentWorkspace,
  "process-mapping": ProcessMappingAgentWorkspace,
  "improvement-initiatives": InitiativesAgentWorkspace,
};

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
  const Workspace = WORKSPACES[slug];

  if (!agent || agent.status !== "live" || !Workspace) {
    notFound();
  }

  return <Workspace />;
}
