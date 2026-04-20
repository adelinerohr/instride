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
};

export type ChoiceCardOption = {
  label: string;
  description?: string;
  icon?: LucideIcon;
  value: boolean | string;
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
  ...props
}: ChoiceCardFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <FieldSet>
      <FieldLegend variant="label" className="mb-3">
        {label}
      </FieldLegend>
      <RadioGroup
        value={field.state.value}
        onValueChange={(v) => field.handleChange(v)}
        className={cn(
          !showRadio && "grid grid-cols-2 gap-4",
          showRadio && "flex gap-2"
        )}
        {...props}
      >
        {options.map((option) => (
          <FieldLabel
            key={String(option.value)}
            htmlFor={`${field.name}-${option.value}`}
            className={cn(showRadio && "w-fit!")}
          >
            <Field
              orientation="horizontal"
              data-invalid={isInvalid}
              className={cn(!showRadio ? "py-4!" : "px-5! py-2!")}
            >
              <RadioGroupItem
                id={`${field.name}-${option.value}`}
                value={option.value}
                className={cn(!showRadio && "hidden")}
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
        ))}
      </RadioGroup>
      {isInvalid && <FieldError errors={errors} />}
    </FieldSet>
  );
}

function BooleanChoiceCardField({
  label,
  options,
  showRadio = false,
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
      <FieldLegend variant="label" className="mb-3">
        {label}
      </FieldLegend>
      <RadioGroup
        value={boolToString(field.state.value)}
        onValueChange={(v) => field.handleChange(stringToBool(v))}
        className={cn(
          !showRadio && "grid grid-cols-2 gap-4",
          showRadio && "flex gap-2"
        )}
        {...props}
      >
        {options.map((option) => (
          <FieldLabel
            key={String(option.value)}
            htmlFor={`${field.name}-${option.value ? "yes" : "no"}`}
            className={cn(showRadio && "w-fit!")}
          >
            <Field
              orientation="horizontal"
              data-invalid={isInvalid}
              className={cn(!showRadio ? "py-4!" : "px-5! py-2!")}
            >
              <RadioGroupItem
                id={`${field.name}-${option.value ? "yes" : "no"}`}
                value={option.value === true ? "true" : "false"}
                className={cn(!showRadio && "hidden")}
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
        ))}
      </RadioGroup>
      {isInvalid && <FieldError errors={errors} />}
    </FieldSet>
  );
}
