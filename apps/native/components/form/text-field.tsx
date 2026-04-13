import {
  Description,
  FieldError,
  Input,
  Label,
  TextArea,
  TextField as TextFieldPrimitive,
} from "heroui-native";
import * as React from "react";

import { useFieldContext } from "@/hooks/use-form";

interface TextFieldProps extends Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChangeText" | "onBlur"
> {
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}

export function TextField({
  label,
  description,
  placeholder,
  required = false,
  textarea = false,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  return (
    <TextFieldPrimitive>
      <Label isRequired={required} isInvalid={isInvalid}>
        {label}
      </Label>
      {textarea ? (
        <TextArea
          isInvalid={isInvalid}
          value={field.state.value}
          placeholder={placeholder}
          onChangeText={(value) => field.handleChange(value)}
          onBlur={field.handleBlur}
          {...props}
        />
      ) : (
        <Input
          isInvalid={isInvalid}
          value={field.state.value}
          placeholder={placeholder}
          onChangeText={(value) => field.handleChange(value)}
          onBlur={field.handleBlur}
          {...props}
        />
      )}
      {description && <Description>{description}</Description>}
      <FieldError isInvalid={isInvalid}>{errors.join(", ")}</FieldError>
    </TextFieldPrimitive>
  );
}
