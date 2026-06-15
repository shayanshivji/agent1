"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AGENT_ROSTER } from "@/data/agent-roster";

export function AgentTopNav() {
  const pathname = usePathname();

  return (
    <nav
      className="bg-white border-b border-[var(--border)]"
      aria-label="Agent navigation"
    >
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-thin">
          {AGENT_ROSTER.map((agent) => {
            const active =
              pathname === agent.href || pathname?.startsWith(`${agent.href}/`);
            const disabled = agent.status !== "live";

            return (
              <Link
                key={agent.slug}
                href={agent.href}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-[var(--mck-navy)] text-white font-medium"
                    : disabled
                      ? "text-[var(--text-muted)] hover:bg-[var(--bg)]"
                      : "text-[var(--text)] hover:bg-[var(--bg)]"
                }`}
              >
                <span className="text-[10px] font-semibold opacity-70">
                  {agent.id}
                </span>
                <span>{agent.shortName}</span>
                {agent.status === "live" && (
                  <span
                    className={`text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    Live
                  </span>
                )}
                {agent.status === "planned" && !active && (
                  <span className="text-[9px] uppercase tracking-wide text-[var(--text-muted)]">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
