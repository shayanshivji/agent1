import type { AgentDefinition } from "@/data/agent-roster";
import { Construction } from "lucide-react";

interface AgentPlaceholderProps {
  agent: AgentDefinition;
}

export function AgentPlaceholder({ agent }: AgentPlaceholderProps) {
  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16 text-center">
      <div className="section-card p-10">
        <Construction className="h-10 w-10 text-[var(--accent)] mx-auto mb-4 opacity-60" />
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--accent)] mb-2">
          Agent {agent.id} · {agent.status}
        </p>
        <h1 className="text-2xl font-semibold text-gradient mb-2">
          {agent.name}
        </h1>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
          {agent.description}
        </p>
        <p className="text-xs text-[var(--text-muted)] bg-[rgba(6,8,15,0.5)] border border-[var(--border)] rounded-lg px-4 py-3">
          {agent.blueprintSummary}
        </p>
        {agent.id === 4 && agent.status !== "live" && (
          <p className="text-xs text-[var(--accent)] mt-4 font-medium">
            Next build priority — after Scoping Agent validation with Emmanuel.
          </p>
        )}
      </div>
    </main>
  );
}
