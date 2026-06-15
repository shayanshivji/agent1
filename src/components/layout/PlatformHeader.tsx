import Link from "next/link";

interface PlatformHeaderProps {
  compact?: boolean;
}

export function PlatformHeader({ compact }: PlatformHeaderProps) {
  return (
    <header className="consulting-header">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="group">
          <p className="text-[10px] uppercase tracking-widest text-white/50 group-hover:text-white/70">
            Blue Currency · Agent Platform
          </p>
          <p
            className={`font-semibold text-white ${compact ? "text-sm" : "text-base"}`}
          >
            PE Growth Diagnostic
          </p>
        </Link>
        <p className="text-xs text-white/50 hidden sm:block">
          Modular agents · combinable codebase
        </p>
      </div>
    </header>
  );
}
