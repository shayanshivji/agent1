"use client";

import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { ScopingAgentWorkspace } from "@/components/agents/ScopingAgentWorkspace";
import { LiveInterviewAgentWorkspace } from "@/components/agents/LiveInterviewAgentWorkspace";
import { ProcessMappingAgentWorkspace } from "@/components/agents/ProcessMappingAgentWorkspace";
import { InitiativesAgentWorkspace } from "@/components/agents/InitiativesAgentWorkspace";
import { PlannedAgentPlaceholder } from "@/components/project/PlannedAgentPlaceholder";
import type { PlatformAgentSlug } from "@/types/platform-session";
import { getAgentBySlug } from "@/data/agent-roster";

const LIVE_WORKSPACE_SLUGS: PlatformAgentSlug[] = [
  "scoping",
  "live-interview",
  "process-mapping",
  "improvement-initiatives",
];

const WORKSPACES: Record<PlatformAgentSlug, ComponentType<{ embedded?: boolean; initialTab?: string }>> = {
  scoping: ScopingAgentWorkspace,
  "live-interview": LiveInterviewAgentWorkspace,
  "process-mapping": ProcessMappingAgentWorkspace,
  "improvement-initiatives": InitiativesAgentWorkspace,
};

interface ProjectAgentHostProps {
  slug: string;
  initialTab?: string;
}

export function ProjectAgentHost({ slug, initialTab }: ProjectAgentHostProps) {
  const agent = getAgentBySlug(slug);
  const Workspace = WORKSPACES[slug as PlatformAgentSlug];

  if (!agent || agent.status !== "live" || !Workspace) {
    notFound();
  }

  return (
    <div className="project-agent-host px-6 py-6">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-wider text-[var(--accent)]">{agent.shortName}</p>
        <h2 className="text-xl font-semibold text-[var(--text)]">{agent.name}</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">{agent.description}</p>
      </div>
      <Workspace embedded initialTab={initialTab} />
    </div>
  );
}

export function isLiveAgentSlug(slug: string): slug is PlatformAgentSlug {
  return LIVE_WORKSPACE_SLUGS.includes(slug as PlatformAgentSlug);
}
