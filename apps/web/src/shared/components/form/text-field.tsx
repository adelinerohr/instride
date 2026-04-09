import * as React from "react";

import { useFieldContext } from "@/shared/hooks/form";

import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { InputGroup, InputGroupInput } from "../ui/input-group";

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
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={field.name}
          name={field.name}
          value={field.state.value ?? ""}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          placeholder={placeholder ?? label}
          {...props}
        />
        {inputGroup && children}
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
