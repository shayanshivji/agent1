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
    <button type="button" onClick={handleOpen} className="cover-action-card group w-full text-left">
      <div className="flex items-start justify-between gap-4">
        <div>
          <PlayCircle className="h-6 w-6 text-emerald-400 mb-3" />
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
              Open demo project
            </h3>
            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              Recommended
            </span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
            Pre-loaded BSN MTS study with interview guide, Walter output, process map, and
            initiatives — no API key needed. Best for demos and walkthroughs.
          </p>
          <p className="text-[10px] text-[var(--accent)] mt-3 font-medium">
            4 agent outputs ready · 100% workflow progress
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] shrink-0 mt-1" />
      </div>
    </button>
  );
}
