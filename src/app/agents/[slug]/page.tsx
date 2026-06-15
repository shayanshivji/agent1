import { notFound } from "next/navigation";
import { AgentPlaceholder } from "@/components/agents/AgentPlaceholder";
import { getAgentBySlug } from "@/data/agent-roster";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AgentSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);

  if (!agent || agent.status === "live") {
    notFound();
  }

  return <AgentPlaceholder agent={agent} />;
}
