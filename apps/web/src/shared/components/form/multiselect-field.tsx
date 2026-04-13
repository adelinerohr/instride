import * as React from "react";

import { useFieldContext } from "@/shared/hooks/form";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "../ui/combobox";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";

type MultiSelectFieldProps<T extends object> = Omit<
  React.ComponentProps<typeof Combobox>,
  "items"
> & {
  label?: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
  items: T[];
  itemToLabel?: (item: T) => string;
  itemToValue: (item: T) => string;
  renderValue: (item: T) => React.ReactNode;
};

export function MultiSelectField<T extends object>({
  label,
  placeholder,
  required,
  description,
  items,
  itemToLabel,
  itemToValue,
  renderValue,
  ...props
}: MultiSelectFieldProps<T>) {
  const anchor = useComboboxAnchor();
  const field = useFieldContext<string[]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const currentItems = items.filter((item) =>
    field.state.value.includes(itemToValue(item))
  );

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Combobox
        value={currentItems}
        onValueChange={(value) => {
          console.log(value);
          field.handleChange((value as T[]).map((v) => itemToValue(v)));
        }}
        multiple
        autoHighlight
        items={items}
        {...props}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(values) => (
              <React.Fragment>
                {values.map((value: T) => (
                  <ComboboxChip key={itemToValue(value)}>
                    {itemToLabel ? itemToLabel(value) : itemToValue(value)}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={field.name}
                  name={field.name}
                  placeholder={placeholder ?? "Select options"}
                  required={required}
                  aria-invalid={isInvalid}
                />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>

        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No options found</ComboboxEmpty>
          <ComboboxList>
            {(item: T) => (
              <ComboboxItem key={itemToValue(item)} value={item}>
                {renderValue(item)}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}
