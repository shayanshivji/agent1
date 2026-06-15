"use client";

import { getPipelineValidation } from "@/lib/process-map/logic";

interface PipelineValidationBannerProps {
  payload: string;
  workflowId?: string;
}

export function PipelineValidationBanner({ payload, workflowId }: PipelineValidationBannerProps) {
  if (!payload.trim()) return null;
  const validation = getPipelineValidation(payload, workflowId);
  if (!validation.error && !validation.warning) return null;

  return (
    <div
      className={`mb-3 rounded-md px-3 py-2 text-xs ${
        validation.error
          ? "error-banner"
          : "border border-yellow-500/30 bg-yellow-500/10 text-yellow-200"
      }`}
    >
      {validation.error ?? validation.warning}
    </div>
  );
}
