"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

interface OutputCardProps {
  title: string;
  detail: string;
  ready: boolean;
  updatedAt?: string;
  href: string;
}

export function OutputCard({ title, detail, ready, updatedAt, href }: OutputCardProps) {
  return (
    <Link href={href} className="output-card group">
      <div className="flex items-start justify-between gap-2">
        {ready ? (
          <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" />
        ) : (
          <Circle className="h-4 w-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
        )}
        <ArrowRight className="h-4 w-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--text)] mt-2 group-hover:text-[var(--accent)]">
        {title}
      </h3>
      <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{detail}</p>
      {updatedAt && (
        <p className="text-[10px] text-[var(--text-muted)] mt-2">
          {new Date(updatedAt).toLocaleString()}
        </p>
      )}
    </Link>
  );
}
