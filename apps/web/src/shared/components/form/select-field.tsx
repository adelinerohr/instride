import { useFieldContext } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type SelectFieldProps<T extends object> = Omit<
  React.ComponentProps<typeof Select>,
  "items" | "value" | "onValueChange" | "itemToStringValue"
> & {
  label?: string;
  description?: string;
  placeholder?: string;
  emptyPlaceholder?: string;
  fieldClassName?: string;
  className?: string;
  items: T[];
  onChange?: (value: string) => void;
  renderValue: (item: T) => React.ReactNode;
  itemToValue: (item: T) => string;
  /** Map stored form/API values to the same string shape as {@link itemToValue} (e.g. DB time → slot key). */
  matchValue?: (stored: string | null | undefined) => string;
  alignItemWithTrigger?: boolean;
};

export function SelectField<T extends object>({
  label,
  description,
  placeholder,
  emptyPlaceholder,
  fieldClassName,
  className,
  items,
  onChange,
  renderValue,
  itemToValue,
  matchValue,
  alignItemWithTrigger = false,
}: SelectFieldProps<T>) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;
  const emptyItems = items.length === 0;

  const valueForMatch = matchValue
    ? matchValue(field.state.value)
    : (field.state.value ?? "");

  const currentItem =
    items.find((item) => itemToValue(item) === valueForMatch) ?? null;

  return (
    <Field data-invalid={isInvalid} className={fieldClassName}>
      {label ||
        (description && (
          <FieldContent>
            {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
            {description && <FieldDescription>{description}</FieldDescription>}
          </FieldContent>
        ))}
      <Select
        name={field.name}
        value={currentItem}
        itemToStringValue={itemToValue}
        onValueChange={(value) => {
          if (onChange) {
            onChange(value ? itemToValue(value) : "");
          } else {
            field.handleChange(value ? itemToValue(value) : "");
          }
        }}
      >
        <SelectTrigger className={cn(className, "h-auto!")}>
          <SelectValue
            placeholder={emptyItems ? emptyPlaceholder : placeholder}
          >
            {currentItem
              ? (item: T | null) => (item != null ? renderValue(item) : null)
              : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={alignItemWithTrigger}>
          {items.map((item) => (
            <SelectItem key={itemToValue(item)} value={item}>
              {renderValue(item)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
