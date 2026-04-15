import { ClockIcon } from "lucide-react";
import * as React from "react";

import { useFieldContext } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

type TextFieldProps = React.ComponentProps<"input"> & {
  label: string;
  placeholder?: string;
  description?: string;
  inputGroup?: boolean;
};

export function TextField({
  label,
  placeholder,
  description,
  inputGroup = false,
  children,
  className,
  type = "text",
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string | number | undefined | null>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "number") {
      const value = e.target.value === "" ? undefined : e.target.valueAsNumber;
      field.handleChange(value);
    } else {
      field.handleChange(e.target.value);
    }
  };

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={field.name}
          name={field.name}
          value={field.state.value ?? ""}
          onBlur={field.handleBlur}
          onChange={handleChange}
          aria-invalid={isInvalid}
          placeholder={placeholder ?? label}
          step={type === "time" ? 1 : props.step}
          type={type}
          className={cn(
            type === "time" &&
              "appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          )}
          {...props}
        />
        {inputGroup && children}
        {type === "time" && (
          <InputGroupAddon align="inline-start">
            <ClockIcon />
          </InputGroupAddon>
        )}
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
