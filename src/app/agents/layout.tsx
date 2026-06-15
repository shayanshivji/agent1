import { PlatformHeader } from "@/components/layout/PlatformHeader";
import { AgentTopNav } from "@/components/layout/AgentTopNav";

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <PlatformHeader compact />
      <AgentTopNav />
      {children}
    </div>
  );
}
