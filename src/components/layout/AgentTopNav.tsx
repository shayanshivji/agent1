"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AGENT_ROSTER } from "@/data/agent-roster";

export function AgentTopNav() {
  const pathname = usePathname();

  return (
    <nav className="agent-nav" aria-label="Agent navigation">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2.5">
          {AGENT_ROSTER.map((agent) => {
            const active =
              pathname === agent.href ||
              pathname?.startsWith(`${agent.href}/`);

            return (
              <Link
                key={agent.slug}
                href={agent.href}
                className={`agent-nav-link ${active ? "agent-nav-link-active" : ""}`}
              >
                <span className="text-[10px] font-mono font-semibold text-[var(--accent)]">
                  {String(agent.id).padStart(2, "0")}
                </span>
                <span>{agent.shortName}</span>
                {agent.status === "live" && (
                  <span className={active ? "badge-live bg-white/10 border-white/20 text-white" : "badge-live"}>
                    Live
                  </span>
                )}
                {agent.status === "planned" && !active && (
                  <span className="badge-soon">Soon</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
