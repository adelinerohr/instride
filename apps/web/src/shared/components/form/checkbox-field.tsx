import {
  Field,
  FieldDescription,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { useFieldContext } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

import { Checkbox } from "../ui/checkbox";

type CheckboxFieldProps = React.ComponentProps<typeof Checkbox> & {
  label: string;
  description?: string;
  labelClassName?: string;
};

export function CheckboxField({
  label,
  description,
  labelClassName,
  ...props
}: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <Field orientation="horizontal" data-invalid={isInvalid}>
      <Checkbox
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={(value) => field.handleChange(Boolean(value))}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        {...props}
      />
      <FieldContent>
        <FieldLabel
          htmlFor={field.name}
          className={cn(!description ? "font-normal" : "", labelClassName)}
        >
          {label}
        </FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
