import { useFieldContext } from "@/shared/hooks/form";

import { Field, FieldError, FieldLabel } from "../ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type BooleanRadioFieldProps = React.ComponentProps<typeof RadioGroup> & {
  trueLabel?: string;
  falseLabel?: string;
};

export function BooleanRadioField({
  trueLabel = "Yes",
  falseLabel = "No",
  ...props
}: BooleanRadioFieldProps) {
  const field = useFieldContext<boolean>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <Field data-invalid={isInvalid}>
      <RadioGroup
        name={field.name}
        value={field.state.value ? "true" : "false"}
        onValueChange={(value) => field.handleChange(value === "true")}
        {...props}
      >
        <Field orientation="horizontal">
          <RadioGroupItem value="true" id={`${field.name}-true`} />
          <FieldLabel htmlFor={`${field.name}-true`}>{trueLabel}</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="false" id={`${field.name}-false`} />
          <FieldLabel htmlFor={`${field.name}-false`}>{falseLabel}</FieldLabel>
        </Field>
      </RadioGroup>
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
