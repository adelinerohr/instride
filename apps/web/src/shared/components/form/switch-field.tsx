import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Switch } from "@/shared/components/ui/switch";
import { useFieldContext } from "@/shared/hooks/use-form";

type SwitchFieldProps = React.ComponentProps<typeof Switch> & {
  label: string;
  description?: string;
};

export function SwitchField({
  label,
  description,
  ...props
}: SwitchFieldProps) {
  const field = useFieldContext<boolean>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <Field orientation="horizontal" data-invalid={isInvalid}>
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
        {isInvalid && <FieldError errors={errors} />}
      </FieldContent>
      <Switch
        id={field.name}
        name={field.name}
        checked={field.state.value ?? false}
        onCheckedChange={field.handleChange}
        aria-invalid={isInvalid}
        {...props}
      />
    </Field>
  );
}
