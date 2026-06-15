import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface WorkspaceBackLinkProps {
  slug: string;
  label: string;
}

export function WorkspaceBackLink({ slug, label }: WorkspaceBackLinkProps) {
  return (
    <Link
      href={`/agents/${slug}`}
      className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {label} overview
    </Link>
  );
}
