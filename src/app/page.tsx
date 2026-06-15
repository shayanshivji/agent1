import { PlatformHeader } from "@/components/layout/PlatformHeader";
import { AgentTopNav } from "@/components/layout/AgentTopNav";
import { PlatformLanding } from "@/components/landing/PlatformLanding";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PlatformHeader />
      <AgentTopNav />
      <PlatformLanding />
    </div>
  );
}
