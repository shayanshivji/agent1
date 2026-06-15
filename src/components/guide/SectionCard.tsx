"use client";

import { useState } from "react";
import type { InterviewSection } from "@/types/guide";
import { ChevronDown, Loader2, RefreshCw } from "lucide-react";

interface SectionCardProps {
  section: InterviewSection;
  index: number;
  onChange: (content: string, bullets?: string[]) => void;
  onRegenerate?: () => void;
  regenerating?: boolean;
  defaultOpen?: boolean;
}

export function SectionCard({
  section,
  index,
  onChange,
  onRegenerate,
  regenerating,
  defaultOpen = index < 3,
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bulletsText = (section.bullets ?? []).join("\n");
  const bulletCount = section.bullets?.length ?? 0;

  return (
    <div className="section-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[rgba(0,212,255,0.04)] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[var(--accent-soft)] border border-[var(--border)] text-xs font-mono font-semibold text-[var(--accent)]">
            {index + 1}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[var(--text)] truncate">
              {section.title}
            </h3>
            {!open && section.content && (
              <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                {section.content}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {bulletCount > 0 && (
            <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg)] px-2 py-0.5 rounded-full">
              {bulletCount} items
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-[var(--border)] pt-4">
          <div className="flex justify-end mb-3">
            {onRegenerate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerate();
                }}
                disabled={regenerating}
                className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline disabled:opacity-50"
              >
                {regenerating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Regenerate section
              </button>
            )}
          </div>

          <label className="field-label">Context</label>
          <textarea
            value={section.content}
            onChange={(e) => onChange(e.target.value, section.bullets)}
            placeholder="Narrative context for this section…"
            rows={2}
            className="field-input resize-y mb-4"
          />

          <label className="field-label">Bullets (one per line)</label>
          <textarea
            value={bulletsText}
            onChange={(e) => {
              const bullets = e.target.value
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);
              onChange(section.content, bullets.length ? bullets : undefined);
            }}
            placeholder="One item per line…"
            rows={Math.max(4, bulletCount + 1)}
            className="field-input font-mono text-xs resize-y"
          />
        </div>
      )}
    </div>
  );
}
