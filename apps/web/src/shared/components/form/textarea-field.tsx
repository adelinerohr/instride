import * as React from "react";

import { useFieldContext } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";

type TextareaFieldProps = React.ComponentProps<"textarea"> & {
  label: string;
  placeholder?: string;
  description?: string;
  optional?: boolean;
};

export function TextareaField({
  label,
  placeholder,
  description,
  className,
  optional = false,
  ...props
}: TextareaFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel
        htmlFor={field.name}
        className={cn(optional && "justify-between")}
      >
        {label}
        {optional && (
          <span className="text-muted-foreground font-normal text-xs">
            Optional
          </span>
        )}
      </FieldLabel>
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder ?? label}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
