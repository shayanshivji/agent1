"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import { DEMO_PROJECT_ID } from "@/data/demo-project-seed";

export function OpenDemoProjectCard() {
  const router = useRouter();
  const openDemoProject = useProjectStore((s) => s.openDemoProject);

  function handleOpen() {
    openDemoProject();
    router.push(`/projects/${DEMO_PROJECT_ID}`);
  }

  return (
    <button type="button" onClick={handleOpen} className="cover-action-card group w-full text-left h-full">
      <PlayCircle className="h-5 w-5 text-[var(--accent)] mb-3" />
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <h3 className="text-base font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
          Open demo project
        </h3>
        <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[var(--accent)]/30 text-[var(--accent)] bg-[var(--accent-soft)]">
          Recommended
        </span>
      </div>
      <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
        Example walkthrough of how the platform works — pre-loaded study with sample outputs across
        all value creation steps. No API key needed.
      </p>
      <span className="inline-flex items-center gap-1 text-xs text-[var(--accent)] mt-4 font-medium">
        Open demo
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
