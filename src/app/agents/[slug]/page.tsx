import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AgentLanding } from "@/components/landing/AgentLanding";
import { getAgentBySlug } from "@/data/agent-roster";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);
  if (!agent) return { title: "Agent | PE Growth Diagnostic" };
  return {
    title: `${agent.name} | PE Growth Diagnostic`,
    description: agent.description,
  };
}

export default async function AgentSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);

  if (!agent) {
    notFound();
  }

  return <AgentLanding agent={agent} />;
}
