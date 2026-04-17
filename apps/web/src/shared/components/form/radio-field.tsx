import { useFieldContext } from "@/shared/hooks/use-form";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "../ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type BooleanRadioFieldProps = React.ComponentProps<typeof RadioGroup> & {
  label: string;
  trueConfig?: {
    label?: string;
    description?: string;
  };
  falseConfig?: {
    label?: string;
    description?: string;
  };
};

export function BooleanRadioField({
  label,
  trueConfig = {
    label: "Yes",
  },
  falseConfig = {
    label: "No",
  },
  ...props
}: BooleanRadioFieldProps) {
  const field = useFieldContext<boolean>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <FieldSet>
      <FieldLegend>{label}</FieldLegend>
      <RadioGroup
        name={field.name}
        value={field.state.value ? "true" : "false"}
        onValueChange={(value) => field.handleChange(value === "true")}
        {...props}
      >
        <Field orientation="horizontal">
          <RadioGroupItem
            value="true"
            id={`${field.name}-true`}
            aria-invalid={isInvalid}
          />
          <FieldContent>
            <FieldTitle>{trueConfig.label}</FieldTitle>
            {trueConfig.description && (
              <FieldDescription>{trueConfig.description}</FieldDescription>
            )}
          </FieldContent>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem
            value="false"
            id={`${field.name}-false`}
            aria-invalid={isInvalid}
          />
          <FieldContent>
            <FieldTitle>{falseConfig.label}</FieldTitle>
            {falseConfig.description && (
              <FieldDescription>{falseConfig.description}</FieldDescription>
            )}
          </FieldContent>
        </Field>
      </RadioGroup>
      {isInvalid && <FieldError errors={errors} />}
    </FieldSet>
  );
}
