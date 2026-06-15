import Link from "next/link";
import { Cpu } from "lucide-react";

interface PlatformHeaderProps {
  compact?: boolean;
}

export function PlatformHeader({ compact }: PlatformHeaderProps) {
  return (
    <header className="consulting-header">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] shadow-sm">
            <Cpu className="h-4 w-4 text-[var(--text-on-accent)]" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] group-hover:text-[var(--text)] transition-colors">
              Blue Currency · Agent OS
            </p>
            <p
              className={`font-semibold text-gradient ${compact ? "text-sm" : "text-base"}`}
            >
              PE Growth Diagnostic
            </p>
          </div>
        </Link>
        <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
          7-agent modular pipeline
        </div>
      </div>
    </header>
  );
}
