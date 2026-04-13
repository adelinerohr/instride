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

interface SelectFieldProps<
  T extends { id: string },
> extends React.ComponentProps<typeof Select> {
  label: string;
  placeholder?: string;
  required?: boolean;
  options: T[];
  itemToValue?: (item: T) => string;
  itemToLabel: (item: T) => string;
  renderValue?: (value: T) => string;
  description?: string;
}

export function SelectField<T extends { id: string }>({
  label,
  placeholder,
  required = false,
  options,
  itemToValue,
  itemToLabel,
  renderValue,
  description,
  ...props
}: SelectFieldProps<T>) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const selectOptions: SelectOption[] = React.useMemo(
    () =>
      options.map((option) => ({
        value: itemToValue?.(option) ?? option.id,
        label: itemToLabel(option),
      })),
    [options, itemToValue, itemToLabel]
  );

  const currentOption = React.useMemo(
    () => selectOptions.find((option) => option.value === field.state.value),
    [selectOptions, field.state.value]
  );

  return (
    <View>
      <Label isRequired={required} isInvalid={isInvalid}>
        {label}
      </Label>
      <Select
        selectionMode="single"
        value={currentOption}
        onValueChange={(value) =>
          field.handleChange((value as SelectOption).value)
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
            {options.map((option, index) =>
              renderValue ? (
                <React.Fragment key={itemToValue?.(option) ?? option.id}>
                  {renderValue(option)}
                </React.Fragment>
              ) : (
                <React.Fragment key={itemToValue?.(option) ?? option.id}>
                  <Select.Item
                    value={itemToValue?.(option) ?? option.id}
                    label={itemToLabel(option)}
                  />
                  {index < options.length - 1 && <Separator />}
                </React.Fragment>
              )
            )}
          </Select.Content>
        </Select.Portal>
      </Select>
      {description && <Description>{description}</Description>}
      <FieldError isInvalid={isInvalid}>{errors.join(", ")}</FieldError>
    </View>
  );
}
