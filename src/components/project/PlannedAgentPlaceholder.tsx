"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { getWorkflowStep } from "@/data/workflow-pipeline";

interface PlannedAgentPlaceholderProps {
  stepId: string;
  projectId: string;
}

export function PlannedAgentPlaceholder({ stepId, projectId }: PlannedAgentPlaceholderProps) {
  const step = getWorkflowStep(stepId);

  return (
    <div className="px-6 py-16 max-w-lg mx-auto text-center">
      <Lock className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
      <h2 className="text-lg font-semibold text-[var(--text)]">
        {step?.label ?? "Coming soon"}
      </h2>
      <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
        {step?.description ?? "This agent is on the roadmap and will plug into the same workflow rail."}
      </p>
      <Link href={`/projects/${projectId}`} className="btn-secondary text-xs mt-6 inline-flex">
        Back to executive summary
      </Link>
    </div>
  );
}
