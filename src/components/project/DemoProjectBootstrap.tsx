"use client";

import { useEffect } from "react";
import { useProjectStore } from "@/store/project-store";

/** Ensures the demo project exists after client hydration. */
export function DemoProjectBootstrap() {
  const ensureDemoProject = useProjectStore((s) => s.ensureDemoProject);

  useEffect(() => {
    ensureDemoProject();
  }, [ensureDemoProject]);

  return null;
}
