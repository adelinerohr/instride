import {
  Description,
  FieldError,
  Label,
  Select,
  Separator,
} from "heroui-native";
import * as React from "react";
import { View } from "react-native";

import { useFieldContext } from "@/hooks/use-form";

type SelectOption = {
  value: string;
  label: string;
};

interface MultiSelectFieldProps extends React.ComponentProps<typeof Select> {
  label: string;
  placeholder?: string;
  required: boolean;
  options: SelectOption[];
  description?: string;
}

export function MultiSelectField({
  label,
  placeholder,
  required = false,
  options,
  description,
  ...props
}: MultiSelectFieldProps) {
  const field = useFieldContext<string[]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const currentOptions = options.filter((option) =>
    field.state.value.includes(option.value)
  );

  return (
    <View>
      <Label isRequired={required} isInvalid={isInvalid}>
        {label}
      </Label>
      <Select
        selectionMode="multiple"
        value={currentOptions}
        onValueChange={(value) =>
          field.handleChange(
            (value as SelectOption[]).map((option) => option.value)
          )
        }
        {...props}
      >
        <Select.Trigger>
          <Select.Value placeholder={placeholder ?? label} />
          <Select.TriggerIndicator />
        </Select.Trigger>
        <Select.Portal>
          <Select.Overlay />
          <Select.Content presentation="popover">
            <Select.ListLabel>{placeholder ?? label}</Select.ListLabel>
            {options.map((option, index) => (
              <React.Fragment key={option.value}>
                <Select.Item value={option.value} label={option.label} />
                {index < options.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </Select.Content>
        </Select.Portal>
      </Select>
      {description && <Description>{description}</Description>}
      <FieldError isInvalid={isInvalid}>{errors.join(", ")}</FieldError>
    </View>
  );
}
