import { useRouteContext } from "@tanstack/react-router";
import { CheckIcon } from "lucide-react";
import * as React from "react";

import { OrganizationLogo } from "@/shared/components/fragments/org-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";

import type { WizardStep } from "../lib/types";

type OnboardingWizardProps = {
  steps: WizardStep[];
  currentStepIndex: number;
  onGoToStep: (step: WizardStep["id"]) => void;
  children: React.ReactNode;
};

export function OnboardingWizard({
  steps,
  currentStepIndex,
  onGoToStep,
  children,
}: OnboardingWizardProps) {
  const { organization } = useRouteContext({ strict: false });

  const displayName = organization?.name ?? "InStride";

  const description = organization
    ? "New Member Onboarding"
    : "Set up your organization";

  return (
    <div className="flex flex-col items-center pt-16 w-full gap-8">
      <div className="flex flex-col items-center gap-2">
        {organization && (
          <OrganizationLogo organization={organization} size="lg" />
        )}
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{displayName}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="flex items-center justify-center">
        {steps.map((step, i) => {
          const isComplete = i < currentStepIndex;
          const isActive = step.id === steps[currentStepIndex].id;

          return (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  "flex items-center gap-1.5 py-1.5 pl-2 pr-2 sm:pr-3 rounded-2xl bg-primary/5 transition-all duration-150",
                  i <= currentStepIndex && "cursor-pointer",
                  i > currentStepIndex ? "opacity-45" : "opacity-100",
                  isActive && "bg-primary",
                  isComplete && "bg-primary/20"
                )}
                onClick={() => i <= currentStepIndex && onGoToStep(step.id)}
              >
                <div
                  className={cn(
                    "size-5 rounded-[50%] bg-primary/10 flex items-center justify-center text-muted-foreground text-xs font-bold shrink-0",
                    isComplete && "bg-primary text-primary-foreground",
                    isActive && "bg-primary-foreground text-primary"
                  )}
                >
                  {isComplete ? <CheckIcon className="size-3" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap hidden sm:block",
                    isActive && "font-semibold text-primary-foreground",
                    isComplete && "text-primary"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "w-10 h-px bg-border shrink-0 transition-colors duration-300",
                    isComplete && "bg-primary"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <Card className="w-full max-w-md pt-0">
        <Progress value={(currentStepIndex / (steps.length - 1)) * 100} />
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {steps[currentStepIndex].label}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {steps[currentStepIndex].description}
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
