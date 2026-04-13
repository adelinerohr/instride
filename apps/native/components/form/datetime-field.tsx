import DateTimePicker from "@react-native-community/datetimepicker";
import { Description, FieldError, Label } from "heroui-native";
import { View } from "react-native";

import { useFieldContext } from "@/hooks/use-form";

interface DatetimeFieldProps {
  label: string;
  required?: boolean;
  description?: string;
}

export function DatetimeField({
  label,
  required = false,
  description,
}: DatetimeFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <View>
      <Label isRequired={required} isInvalid={isInvalid}>
        {label}
      </Label>
      <DateTimePicker
        value={new Date(field.state.value)}
        mode="datetime"
        is24Hour={false}
        onValueChange={(_event, selectedDate) =>
          field.handleChange(selectedDate.toISOString())
        }
      />
      {description && <Description>{description}</Description>}
      <FieldError isInvalid={isInvalid}>{errors?.join(", ")}</FieldError>
    </View>
  );
}
