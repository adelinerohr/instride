import * as React from "react";

export type WizardForm<TFieldName extends string = string> = {
  validateField: (name: TFieldName, cause: "submit") => any;
  setFieldValue: (name: TFieldName, value: any) => void;
  setFieldMeta: (name: TFieldName, updater: (prev: any) => any) => void;
  handleSubmit: () => any;
  state: {
    fieldMeta: Record<
      string,
      { errors?: unknown[]; isTouched?: boolean } | undefined
    >;
  };
};

export type WizardStepConfig<
  TId extends string,
  TFieldName extends string = string,
> = {
  /** Stable identifier — used for navigation, indicator rendering, URL sync. */
  id: TId;
  /**
   * Form field paths owned by this step. On `next()` these are validated with
   * cause "submit"; if any has errors after validation, the step blocks.
   * Use TanStack Form's dotted/bracket path syntax (e.g. `"personalDetails"`,
   * `"items[0].name"`).
   */
  fields?: TFieldName[];
  /**
   * Custom guard run after field validation. Return `false` (or a string error
   * to surface) to block. Async is fine.
   */
  canAdvance?: () => boolean | string | Promise<boolean | string>;
};

export type UseWizardOptions<
  TId extends string,
  TFieldName extends string = string,
> = {
  steps: WizardStepConfig<TId, TFieldName>[];
  form: WizardForm<TFieldName>;

  /** Controlled mode: caller owns the current step (e.g. it's a form field). */
  value?: TId;
  onChange?: (id: TId) => void;
  /** Uncontrolled mode: hook owns it. Defaults to first step. */
  defaultStepId?: TId;

  /** Called when the last step's `next()` would advance off the end. */
  onComplete?: () => void | Promise<void>;
};

export type WizardApi<
  TId extends string,
  TFieldName extends string = string,
> = {
  // State
  currentId: TId;
  currentIndex: number;
  currentStep: WizardStepConfig<TId, TFieldName>;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoBack: boolean;
  isAdvancing: boolean;
  /** Last block reason from `canAdvance` (string error). Cleared on next attempt. */
  blockReason: string | null;

  // Lookup
  steps: WizardStepConfig<TId, TFieldName>[];
  getStep: (id: TId) => WizardStepConfig<TId, TFieldName> | undefined;
  getStepIndex: (id: TId) => number;

  // Navigation
  /** Validate this step's fields + canAdvance. If OK, move to next or call onComplete. */
  next: () => Promise<void>;
  back: () => void;
  /** Jump backward only — never skip ahead over an unvalidated step. */
  goTo: (id: TId) => void;
  /** Validate without advancing. Useful for "Save draft" buttons. */
  validateCurrentStep: () => Promise<boolean>;

  // Matching
  /** Type-narrowed step renderer bound to this wizard's current step. */
  match: <TReturn>(cases: Record<TId, (id: TId) => TReturn>) => TReturn;
  /** Like 'match', but cases can be omitted */
  matchPartial: (
    cases: Partial<Record<TId, (id: TId) => React.ReactNode>>
  ) => React.ReactNode;
};

export function useWizard<
  TId extends string,
  TFieldName extends string = string,
>(options: UseWizardOptions<TId, TFieldName>): WizardApi<TId, TFieldName> {
  const firstStep = options.steps[0];
  if (!firstStep) {
    throw new Error("At least one step is required");
  }

  const isControlled = options.value !== undefined;

  const [internalId, setInternalId] = React.useState<TId>(
    options.defaultStepId ?? options.steps[0].id
  );
  const [isAdvancing, setIsAdvancing] = React.useState(false);
  const [blockReason, setBlockReason] = React.useState<string | null>(null);

  const currentId = options.value ?? internalId;
  const rawIndex = options.steps.findIndex((step) => step.id === currentId);
  const currentIndex = rawIndex === -1 ? 0 : rawIndex;
  const currentStep = options.steps[currentIndex] ?? firstStep;

  const setStep = React.useCallback(
    (id: TId) => {
      if (isControlled) options.onChange?.(id);
      else setInternalId(id);
    },
    [isControlled, options.onChange]
  );

  const getStepIndex = React.useCallback(
    (id: TId) => options.steps.findIndex((step) => step.id === id),
    [options.steps]
  );

  const getStep = React.useCallback(
    (id: TId) => options.steps.find((step) => step.id === id),
    [options.steps]
  );

  const validateStep = React.useCallback(
    async (step: WizardStepConfig<TId, TFieldName>): Promise<boolean> => {
      if (step.fields?.length) {
        await Promise.all(
          step.fields.map((name) => options.form.validateField(name, "submit"))
        );

        const fieldMeta = options.form.state.fieldMeta;
        const fieldsWithErrors = step.fields.filter(
          (name) => (fieldMeta[name]?.errors ?? []).length > 0
        );

        if (fieldsWithErrors.length) {
          step.fields.forEach((name) => {
            options.form.setFieldMeta(name, (prev) => ({
              ...prev,
              isTouched: true,
            }));
          });

          setBlockReason(null);
          return false;
        }
      }

      if (step.canAdvance) {
        const result = await step.canAdvance();
        if (result === false) {
          setBlockReason(null);
          return false;
        }
        if (typeof result === "string") {
          setBlockReason(result);
          return false;
        }
      }

      setBlockReason(null);
      return true;
    },
    [options.form]
  );

  const next = React.useCallback(async () => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    try {
      const ok = await validateStep(currentStep);
      if (!ok) return;

      const nextStep = options.steps[currentIndex + 1];
      if (nextStep) {
        setStep(nextStep.id);
      } else if (options.onComplete) {
        await options.onComplete();
      } else {
        await options.form.handleSubmit();
      }
    } finally {
      setIsAdvancing(false);
    }
  }, [
    isAdvancing,
    validateStep,
    currentStep,
    options.steps,
    currentIndex,
    setStep,
    options.onComplete,
    options.form,
  ]);

  const back = React.useCallback(() => {
    const prevStep = options.steps[currentIndex - 1];
    if (prevStep) {
      setBlockReason(null);
      setStep(prevStep.id);
    }
  }, [options.steps, currentIndex, setStep]);

  const goTo = React.useCallback(
    (id: TId) => {
      const targetIndex = getStepIndex(id);
      if (targetIndex === -1 && targetIndex < currentIndex) {
        setBlockReason(null);
        setStep(id);
      }
    },
    [getStepIndex, currentIndex, setStep]
  );

  const validateCurrentStep = React.useCallback(
    () => validateStep(currentStep),
    [validateStep, currentStep]
  );

  const match = <TReturn>(cases: Record<TId, (id: TId) => TReturn>): TReturn =>
    cases[currentId](currentId);

  const matchPartial = (
    cases: Partial<Record<TId, (id: TId) => React.ReactNode>>
  ): React.ReactNode => {
    const fn = cases[currentId];
    return fn ? fn(currentId) : null;
  };

  return {
    currentId,
    currentIndex,
    currentStep,
    isFirstStep: currentIndex === 0,
    isLastStep: currentIndex === options.steps.length - 1,
    canGoBack: currentIndex > 0,
    isAdvancing,
    blockReason,

    steps: options.steps,
    getStep,
    getStepIndex,

    next,
    back,
    goTo,
    validateCurrentStep,

    match,
    matchPartial,
  };
}
