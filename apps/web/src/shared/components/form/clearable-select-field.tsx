import { useFieldContext } from "@/shared/hooks/form";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type ClearableSelectFieldProps<T extends object> = Omit<
  React.ComponentProps<typeof Select>,
  "items" | "value" | "onValueChange" | "itemToStringValue"
> & {
  label?: string;
  description?: string;
  placeholder?: string;
  clearableLabel?: string;
  emptyPlaceholder?: string;
  fieldClassName?: string;
  className?: string;
  disabledHint?: string;
  items: T[];
  onChange?: (value: string | null) => void;
  renderValue: (item: T) => React.ReactNode;
  itemToValue: (item: T | null) => string | null;
};

export function ClearableSelectField<T extends object>({
  label,
  description,
  placeholder,
  clearableLabel,
  emptyPlaceholder,
  fieldClassName,
  className,
  items,
  onChange,
  renderValue,
  itemToValue,
  disabled,
  disabledHint,
}: ClearableSelectFieldProps<T>) {
  const field = useFieldContext<string | null>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;
  const emptyItems = items.length === 0;

  const currentItem =
    items.find((item) => itemToValue(item) === field.state.value) ?? null;

  const selectElement = (
    <Select
      name={field.name}
      value={currentItem}
      onValueChange={(value) => {
        const stringValue = typeof value === "string" ? value : null;
        if (onChange) {
          onChange(stringValue);
        } else {
          field.handleChange(stringValue);
        }
      }}
      disabled={disabled && !disabledHint} // ← only truly disable if no hint
    >
      <SelectTrigger
        className={cn(
          className,
          disabled && disabledHint && "opacity-50 w-full"
        )}
      >
        <SelectValue placeholder={emptyItems ? emptyPlaceholder : placeholder}>
          {currentItem ? (item: T) => renderValue(item) : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectItem value={null}>{placeholder ?? clearableLabel}</SelectItem>
        {items.map((item) => (
          <SelectItem key={itemToValue(item)} value={item}>
            {renderValue(item)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <Field data-invalid={isInvalid} className={fieldClassName}>
      <FieldContent>
        {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      {disabled && disabledHint ? (
        <Tooltip>
          <TooltipTrigger render={<div className="w-full" />}>
            {selectElement}
          </TooltipTrigger>
          <TooltipContent>{disabledHint}</TooltipContent>
        </Tooltip>
      ) : (
        selectElement
      )}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
