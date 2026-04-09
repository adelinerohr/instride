import { useFieldContext } from "@/shared/hooks/form";

import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { PhoneInput } from "../ui/phone-input";

type PhoneFieldProps = React.ComponentProps<typeof PhoneInput> & {
  label: string;
  description?: string;
};

export function PhoneField({ label, description, ...props }: PhoneFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <PhoneInput
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(value) => field.handleChange(value)}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
