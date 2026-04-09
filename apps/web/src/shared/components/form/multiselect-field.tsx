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

type Item = { value: string; label: string };

type MultiSelectFieldProps = React.ComponentProps<typeof Combobox> & {
  label?: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
  items: Item[];
};

export function MultiSelectField({
  label,
  placeholder,
  required,
  description,
  items,
  ...props
}: MultiSelectFieldProps) {
  const anchor = useComboboxAnchor();
  const field = useFieldContext<string[]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Combobox
        value={items.filter((item) => field.state.value.includes(item.value))}
        onValueChange={(value) => {
          console.log(value);
          field.handleChange((value as Item[]).map((v) => v.value));
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
                {values.map((value: Item) => (
                  <ComboboxChip key={value.value}>{value.label}</ComboboxChip>
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
            {(item) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
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
