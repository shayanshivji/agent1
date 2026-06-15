"use client";

const STEPS = [
  { id: 1, label: "Configure" },
  { id: 2, label: "Generate" },
  { id: 3, label: "Edit & export" },
];

interface WorkflowStepperProps {
  currentStep: number;
  hasGuide: boolean;
}

export function WorkflowStepper({ currentStep, hasGuide }: WorkflowStepperProps) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => {
        const done = step.id < currentStep || (step.id === 3 && hasGuide);
        const active = step.id === currentStep;

        return (
          <div key={step.id} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`h-px w-8 sm:w-12 ${done ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
              />
            )}
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? "bg-[var(--accent)] text-[var(--text-on-accent)]"
                    : active
                      ? "bg-[var(--accent)] text-[var(--text-on-accent)]"
                      : "bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]"
                }`}
              >
                {done && step.id < currentStep ? "✓" : step.id}
              </span>
              <span
                className={`text-sm hidden sm:inline ${
                  active || done
                    ? "font-medium text-[var(--accent)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
