import * as React from "react";

import type { WizardApi, WizardStepConfig } from "../hooks/use-wizard";

/**
 * The read-only slice of the wizard.
 * Anything that takes a TId as input (goTo, getStep, getStepIndex) is NOT
 * here on purpose. Those should be called from the wizard owner, where the
 * typed `wizard` is in scope, or passed down as explicit props/callbacks.
 */
export type WizardReadApi<TId extends string> = {
  currentId: TId;
  currentIndex: number;
  currentStep: WizardStepConfig<TId>;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoBack: boolean;
  isAdvancing: boolean;
  blockReason: string | null;
  steps: ReadonlyArray<WizardStepConfig<TId>>;

  // Navigation callbacks that DON'T take a step ID — safe to put here.
  next: () => Promise<void>;
  back: () => void;
  validateCurrentStep: () => Promise<boolean>;

  // Matching
  match: <TReturn>(cases: Record<TId, (id: TId) => TReturn>) => TReturn;
  matchPartial: (
    cases: Partial<Record<TId, (id: TId) => React.ReactNode>>
  ) => React.ReactNode;
};

const WizardContext = React.createContext<WizardReadApi<string> | null>(null);

export type WizardProviderProps<TId extends string> = {
  wizard: WizardApi<TId>;
  children: React.ReactNode;
};

export function WizardProvider<TId extends string>({
  wizard,
  children,
}: WizardProviderProps<TId>) {
  return (
    <WizardContext.Provider value={wizard}>{children}</WizardContext.Provider>
  );
}

export function useWizardContext<TId extends string>(): WizardReadApi<TId> {
  const context = React.useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context as WizardReadApi<TId>;
}
