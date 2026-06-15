import type { UpstreamPipelinePayload } from "@/types/pipeline";

export interface PipelineValidation {
  valid: boolean;
  parsed: UpstreamPipelinePayload | null;
  error: string | null;
  warning: string | null;
}

export function validatePipelinePayload(
  raw: string,
  options?: { workflowId?: string },
): PipelineValidation {
  if (!raw.trim()) {
    return { valid: true, parsed: null, error: null, warning: null };
  }

  try {
    const parsed = JSON.parse(raw) as UpstreamPipelinePayload & { fullDocument?: unknown };
    const hasSteps = (parsed.processSteps?.length ?? 0) > 0;
    const hasPains = (parsed.painPoints?.length ?? 0) > 0;
    const hasFullDoc = Boolean(parsed.fullDocument);

    if (!hasSteps && !hasPains && !hasFullDoc) {
      return {
        valid: false,
        parsed,
        error:
          "Pipeline JSON has no processSteps or painPoints. Paste a valid Agent 2/3 handoff or switch to standalone mode.",
        warning: null,
      };
    }

    if (
      options?.workflowId &&
      parsed.workflowId &&
      parsed.workflowId !== options.workflowId
    ) {
      return {
        valid: true,
        parsed,
        error: null,
        warning: `Pipeline workflow (${parsed.workflowId}) differs from selected workflow (${options.workflowId}).`,
      };
    }

    return { valid: true, parsed, error: null, warning: null };
  } catch {
    return {
      valid: false,
      parsed: null,
      error: "Invalid JSON — check syntax or paste a valid handoff export.",
      warning: null,
    };
  }
}
