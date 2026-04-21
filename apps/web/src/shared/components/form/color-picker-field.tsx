import { ColorPicker } from "@/shared/components/ui/color-picker";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { useFieldContext } from "@/shared/hooks/use-form";
import type { CategoryColor } from "@/shared/lib/config/colors";

type ColorPickerFieldProps = {
  label?: string;
  className?: string;
};

export function ColorPickerField({ label, className }: ColorPickerFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel>{label}</FieldLabel>
      <ColorPicker
        className={className}
        value={field.state.value}
        onChange={(color: CategoryColor) => field.handleChange(color)}
      />
      {!!isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
