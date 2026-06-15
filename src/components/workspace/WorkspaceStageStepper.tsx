"use client";

export interface WorkspaceStage {
  id: number;
  label: string;
}

interface WorkspaceStageStepperProps {
  steps: WorkspaceStage[];
  currentStep: number;
  maxReachableStep: number;
  onStepClick?: (step: number) => void;
}

export function WorkspaceStageStepper({
  steps,
  currentStep,
  maxReachableStep,
  onStepClick,
}: WorkspaceStageStepperProps) {
  return (
    <div className="workspace-stage-stepper">
      {steps.map((step, i) => {
        const done = step.id < currentStep;
        const active = step.id === currentStep;
        const reachable = step.id <= maxReachableStep;

        return (
          <div key={step.id} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`h-px w-8 sm:w-16 ${done ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
              />
            )}
            <button
              type="button"
              disabled={!reachable || !onStepClick}
              onClick={() => reachable && onStepClick?.(step.id)}
              className={`flex items-center gap-2 rounded-lg px-1 py-0.5 transition-colors ${
                reachable && onStepClick ? "hover:bg-[var(--accent-soft)] cursor-pointer" : "cursor-default"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shrink-0 ${
                  done
                    ? "bg-[var(--accent)] text-[#06080f] shadow-[0_0_12px_var(--accent-glow)]"
                    : active
                      ? "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] text-[#06080f]"
                      : "bg-[rgba(6,8,15,0.6)] text-[var(--text-muted)] border border-[var(--border)]"
                }`}
              >
                {done ? "✓" : step.id}
              </span>
              <span
                className={`text-sm hidden sm:inline ${
                  active || done ? "font-medium text-[var(--accent)]" : "text-[var(--text-muted)]"
                }`}
              >
                {step.label}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export const DEFAULT_WORKSPACE_STAGES: WorkspaceStage[] = [
  { id: 1, label: "Configure" },
  { id: 2, label: "Sources" },
  { id: 3, label: "Output" },
];

export const SCOPING_WORKSPACE_STAGES: WorkspaceStage[] = [
  { id: 1, label: "Context" },
  { id: 2, label: "Review guide" },
  { id: 3, label: "Export" },
];
