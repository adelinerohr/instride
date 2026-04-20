import { passwordValidator } from "@instride/shared";
import {
  CircleCheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  XCircleIcon,
} from "lucide-react";
import * as React from "react";

import { useFieldContext } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

import { Field, FieldError, FieldLabel } from "../../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../ui/input-group";

type PasswordFieldProps = React.ComponentProps<"input"> & {
  label: string;
  placeholder?: string;
  showRequirements?: boolean;
};

export function PasswordField({
  label,
  placeholder,
  className,
  showRequirements = false,
  ...props
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const getRequirements = () => {
    if (!showRequirements) return null;

    const containsLowerAndUpperCase =
      passwordValidator.containsLowerAndUpperCase(field.state.value);
    const hasMinimumLength = passwordValidator.hasMinimumLength(
      field.state.value
    );
    const containsNumber = passwordValidator.containsNumber(field.state.value);
    const isPasswordValid =
      containsLowerAndUpperCase && hasMinimumLength && containsNumber;

    return isPasswordValid
      ? { met: true, text: "All requirements met" }
      : {
          met: false,
          text: !hasMinimumLength
            ? "8 or more characters"
            : !containsLowerAndUpperCase
              ? "Contains at least one lowercase and one uppercase letter"
              : "Contains at least one number",
        };
  };

  const requirement = showRequirements ? getRequirements() : null;

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={field.name}
          name={field.name}
          value={field.state.value ?? ""}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          placeholder={placeholder ?? label}
          type={showPassword ? "text" : "password"}
          autoCapitalize="off"
          {...props}
        />
        <InputGroupAddon align="inline-start">
          <LockIcon />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={() => setShowPassword((prev) => !prev)}>
            {!showPassword ? <EyeIcon /> : <EyeOffIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {showRequirements && requirement && (
        <div
          className={cn(
            "flex items-center gap-1.5 px-1 font-medium text-xs leading-none",
            requirement.met
              ? "text-green-500"
              : errors
                ? "text-destructive"
                : "text-muted-foreground"
          )}
        >
          {requirement.met ? (
            <CircleCheckIcon className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <XCircleIcon className="h-3.5 w-3.5 shrink-0" />
          )}
          <span>{requirement.text}</span>
        </div>
      )}
      {isInvalid && !showRequirements && <FieldError errors={errors} />}
    </Field>
  );
}
