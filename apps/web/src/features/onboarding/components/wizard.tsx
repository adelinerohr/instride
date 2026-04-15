import { CheckIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import type { WizardStep } from "../lib/types";

type OnboardingWizardProps = {
  steps: WizardStep[];
  title?: string;
  description?: string;
  currentStepIndex: number;
  onGoToStep: (step: WizardStep["id"]) => void;
  children: React.ReactNode;
};

export function OnboardingWizard({
  steps,
  title = "Set up your organization",
  description = "You can update these details later",
  currentStepIndex,
  onGoToStep,
  children,
}: OnboardingWizardProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mb-8 flex items-center gap-3">
        {steps.map((step, i) => {
          const isComplete = i < currentStepIndex;
          const isActive = step.id === steps[currentStepIndex].id;

          return (
            <div key={step.id} className="flex items-center gap-3">
              <div
                onClick={() => {
                  if (!isComplete && !isActive) return;
                  onGoToStep(step.id);
                }}
                className={cn(
                  "flex items-center gap-2",
                  !isComplete && !isActive && "pointer-events-none opacity-50"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                    isComplete && "bg-primary text-primary-foreground",
                    isActive && "border-2 border-primary text-primary",
                    !isComplete &&
                      !isActive &&
                      "border border-muted text-muted-foreground"
                  )}
                >
                  {isComplete ? <CheckIcon className="size-3" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    isActive ? "font-medium" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && <div className="h-px w-8 bg-border" />}
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
