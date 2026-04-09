import { useFieldContext } from "@/shared/hooks/form";

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

type SelectFieldProps = Omit<
  React.ComponentProps<"select">,
  "value" | "defaultValue" | "onChange"
> & {
  label?: string;
  description?: string;
  placeholder?: string;
  clearable?: boolean;
  clearableLabel?: string;
  emptyPlaceholder?: string;
  fieldClassName?: string;
  items: { label: string; value: string; icon?: React.ReactNode }[];
};

export function SelectField({
  label,
  description,
  placeholder,
  clearable = false,
  clearableLabel,
  emptyPlaceholder,
  fieldClassName,
  items,
  className,
  ...props
}: SelectFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const emptyItems = items.length === 0;

  const handleChange = (value: string) => {
    field.handleChange(value === "reset" ? "" : value);
  };

  const placeholderValue = emptyItems ? emptyPlaceholder : placeholder;

  return (
    <Field data-invalid={isInvalid} className={fieldClassName}>
      <FieldContent>
        {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      <Select
        items={items}
        name={field.name}
        value={field.state.value}
        onValueChange={(value) => handleChange(value as string)}
        {...props}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholderValue} />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {clearable && <SelectItem value={null}>{clearableLabel}</SelectItem>}
          {items.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              className="flex items-center gap-2"
            >
              {item.icon}
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
