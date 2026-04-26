import type { LucideIcon } from "lucide-react";

import {
  Field,
  FieldDescription,
  FieldContent,
  FieldLabel,
  FieldTitle,
  FieldSet,
  FieldLegend,
  FieldError,
} from "@/shared/components/ui/field";
import { useFieldContext } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type ChoiceCardFieldProps = React.ComponentProps<typeof RadioGroup> & {
  label: string;
  description?: string;
  isBoolean?: boolean;
  showRadio?: boolean;
  options: ChoiceCardOption[];
  /**
   * Optional helper text rendered below the legend. Useful for explaining
   * why an option is locked (e.g. "You were invited as a guardian").
   */
  hint?: string;
};

export type ChoiceCardOption = {
  label: string;
  description?: string;
  icon?: LucideIcon;
  value: boolean | string;
  /**
   * If true, this option is shown but cannot be selected. The currently-
   * selected option should never be disabled — callers are responsible
   * for ensuring the invariant.
   */
  disabled?: boolean;
};

export function ChoiceCardField({
  isBoolean = false,
  ...props
}: ChoiceCardFieldProps) {
  if (isBoolean) {
    return <BooleanChoiceCardField {...props} />;
  }

  return <MultiChoiceCardField {...props} />;
}

function MultiChoiceCardField({
  label,
  options,
  showRadio = false,
  hint,
  disabled,
  ...props
}: ChoiceCardFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <FieldSet>
      <FieldLegend variant="label" className={cn(hint ? "mb-1" : "mb-3")}>
        {label}
      </FieldLegend>
      {hint && (
        <FieldDescription className="mb-3 text-xs">{hint}</FieldDescription>
      )}
      <RadioGroup
        value={field.state.value}
        onValueChange={(v) => field.handleChange(v)}
        className={cn(
          !showRadio && "grid grid-cols-2 gap-4",
          showRadio && "flex gap-2"
        )}
        disabled={disabled}
        {...props}
      >
        {options.map((option) => {
          const isOptionDisabled = disabled || option.disabled;
          return (
            <FieldLabel
              key={String(option.value)}
              htmlFor={`${field.name}-${option.value}`}
              className={cn(
                showRadio && "w-fit!",
                isOptionDisabled && "cursor-not-allowed opacity-50"
              )}
              data-disabled={isOptionDisabled || undefined}
            >
              <Field
                orientation="horizontal"
                data-invalid={isInvalid}
                data-disabled={isOptionDisabled || undefined}
                className={cn(!showRadio ? "py-4!" : "px-5! py-2!")}
              >
                <RadioGroupItem
                  id={`${field.name}-${option.value}`}
                  value={option.value}
                  className={cn(!showRadio && "hidden")}
                  disabled={isOptionDisabled}
                />
                <FieldContent
                  className={cn(
                    option.icon && "justify-center items-center gap-3"
                  )}
                >
                  {option.icon && (
                    <option.icon
                      className={cn(
                        "shrink-0 text-muted-foreground size-5",
                        field.state.value === option.value && "text-primary"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      option.icon && "flex flex-col items-center justify-center"
                    )}
                  >
                    <FieldTitle className={cn(option.icon && "text-center")}>
                      {option.label}
                    </FieldTitle>
                    {option.description && (
                      <FieldDescription
                        className={cn("text-xs", option.icon && "text-center")}
                      >
                        {option.description}
                      </FieldDescription>
                    )}
                  </div>
                </FieldContent>
              </Field>
            </FieldLabel>
          );
        })}
      </RadioGroup>
      {isInvalid && <FieldError errors={errors} />}
    </FieldSet>
  );
}

function BooleanChoiceCardField({
  label,
  options,
  showRadio = false,
  hint,
  disabled,
  ...props
}: ChoiceCardFieldProps) {
  const field = useFieldContext<boolean>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const boolToString = (value: boolean | null | undefined) =>
    value === true ? "true" : value === false ? "false" : "";

  const stringToBool = (value: string) => value === "true";

  return (
    <FieldSet>
      <FieldLegend variant="label" className={cn(hint ? "mb-1" : "mb-3")}>
        {label}
      </FieldLegend>
      {hint && (
        <FieldDescription className="mb-3 text-xs">{hint}</FieldDescription>
      )}
      <RadioGroup
        value={boolToString(field.state.value)}
        onValueChange={(v) => field.handleChange(stringToBool(v))}
        className={cn(
          !showRadio && "grid grid-cols-2 gap-4",
          showRadio && "flex gap-2"
        )}
        disabled={disabled}
        {...props}
      >
        {options.map((option) => {
          const isOptionDisabled = disabled || option.disabled;
          return (
            <FieldLabel
              key={String(option.value)}
              htmlFor={`${field.name}-${option.value ? "yes" : "no"}`}
              className={cn(
                showRadio && "w-fit!",
                isOptionDisabled && "cursor-not-allowed opacity-50"
              )}
              data-disabled={isOptionDisabled || undefined}
            >
              <Field
                orientation="horizontal"
                data-invalid={isInvalid}
                data-disabled={isOptionDisabled || undefined}
                className={cn(!showRadio ? "py-4!" : "px-5! py-2!")}
              >
                <RadioGroupItem
                  id={`${field.name}-${option.value ? "yes" : "no"}`}
                  value={option.value === true ? "true" : "false"}
                  className={cn(!showRadio && "hidden")}
                  disabled={isOptionDisabled}
                />
                <FieldContent
                  className={cn(
                    option.icon && "justify-center items-center gap-3"
                  )}
                >
                  {option.icon && (
                    <option.icon
                      className={cn(
                        "shrink-0 text-muted-foreground size-5",
                        field.state.value === option.value && "text-primary"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      option.icon && "flex flex-col items-center justify-center"
                    )}
                  >
                    <FieldTitle className={cn(option.icon && "text-center")}>
                      {option.label}
                    </FieldTitle>
                    {option.description && (
                      <FieldDescription
                        className={cn("text-xs", option.icon && "text-center")}
                      >
                        {option.description}
                      </FieldDescription>
                    )}
                  </div>
                </FieldContent>
              </Field>
            </FieldLabel>
          );
        })}
      </RadioGroup>
      {isInvalid && <FieldError errors={errors} />}
    </FieldSet>
  );
}
