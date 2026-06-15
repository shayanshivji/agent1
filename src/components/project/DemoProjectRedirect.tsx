"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/store/project-store";
import { DEMO_PROJECT_ID } from "@/data/demo-project-seed";

export function DemoProjectRedirect() {
  const router = useRouter();
  const openDemoProject = useProjectStore((s) => s.openDemoProject);

  useEffect(() => {
    openDemoProject();
    router.replace(`/projects/${DEMO_PROJECT_ID}`);
  }, [openDemoProject, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-[var(--text-muted)]">
      Opening demo project…
    </div>
  );
}
