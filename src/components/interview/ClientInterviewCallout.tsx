import { Users } from "lucide-react";

/** Week 3 / commercial callout — client-facing interviews live outside McKinsey SSO. */
export function ClientInterviewCallout() {
  return (
    <aside className="section-card p-4 border-l-4 border-l-[var(--warning)] mb-6">
      <div className="flex gap-3">
        <Users className="h-4 w-4 text-[var(--warning)] shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-[var(--text)]">Client-facing interviews (Week 3+)</p>
          <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
            Portfolio-company SMEs cannot access McKinsey-internal tools directly. For production,
            interviews may run on a separate client portal (domain-restricted access, e.g.{" "}
            <span className="font-mono text-[10px]">@client.com</span>) with transcripts flowing back
            into this step. Commercial packaging and access controls to be finalized with leadership.
          </p>
        </div>
      </div>
    </aside>
  );
}
