import type { types } from "@instride/api";
import { AlertCircleIcon, CircleIcon } from "lucide-react";

import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useFieldContext } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

import { Badge } from "../../ui/badge";

interface BaseProps {
  services: types.Service[];
  placeholder?: string;
  className?: string;
  hideLabel?: boolean;
}

interface ClearableServiceSelectFieldProps extends BaseProps {
  clearable?: true;
  disabled?: boolean;
  disabledHint?: string;
  clearableLabel?: string;
}

interface ServiceSelectFieldProps extends BaseProps {
  clearable?: false;
}

type Props = ClearableServiceSelectFieldProps | ServiceSelectFieldProps;

export function ServiceSelectField({ clearable = false, ...props }: Props) {
  if (clearable) {
    return <ClearableServiceSelectField {...props} />;
  }

  return <SingleServiceSelectField {...props} />;
}

function SingleServiceSelectField({
  services,
  placeholder,
  className,
  hideLabel = false,
}: Omit<ServiceSelectFieldProps, "clearable">) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const currentItem = services.find(
    (service) => service.id === field.state.value
  );

  return (
    <Field data-invalid={isInvalid} className={className}>
      {!hideLabel && <FieldLabel>Service</FieldLabel>}
      <Select
        name={field.name}
        value={currentItem}
        itemToStringValue={(service) => service.id}
        onValueChange={(value) => field.handleChange(value ? value.id : "")}
      >
        <SelectTrigger className="h-auto!">
          <SelectValue placeholder={placeholder ?? "Select a service"}>
            {currentItem
              ? (value: types.Service | null) =>
                  value != null ? renderValue(value) : null
              : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {services.map((service) => (
            <SelectItem key={service.id} value={service}>
              {renderValue(service)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}

function ClearableServiceSelectField({
  services,
  placeholder,
  className,
  disabled,
  disabledHint,
  clearableLabel,
  hideLabel = false,
}: Omit<ClearableServiceSelectFieldProps, "clearable">) {
  const field = useFieldContext<string | null>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const currentItem =
    services.find((service) => service.id === field.state.value) ?? null;

  return (
    <Field data-invalid={isInvalid}>
      {!hideLabel && <FieldLabel>Service</FieldLabel>}
      <Select
        name={field.name}
        value={currentItem}
        itemToStringValue={(service) => service.id}
        onValueChange={(value) => field.handleChange(value ? value.id : null)}
      >
        <SelectTrigger
          className={cn(
            className,
            disabled && disabledHint && "opacity-50 w-full"
          )}
        >
          <SelectValue placeholder={placeholder ?? "Select a service"}>
            {currentItem
              ? (service: types.Service) => renderValue(service)
              : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectItem value={null}>{placeholder ?? clearableLabel}</SelectItem>
          {services.map((service) => (
            <SelectItem key={service.id} value={service}>
              {renderValue(service)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}

const renderValue = (service: types.Service) => (
  <div className="flex items-center gap-2 p-1 w-full justify-between">
    <div className="flex items-center gap-2">
      <span className="font-semibold">{service.name}</span>
      <span className="text-sm text-muted-foreground">
        {service.duration} minutes
      </span>
    </div>
    <div className="flex items-center gap-2">
      <Badge
        className="ml-auto"
        variant={service.restrictedToLevel ? "outline" : "secondary"}
      >
        {service.restrictedToLevel && (
          <CircleIcon
            fill={service.restrictedToLevel.color}
            stroke={service.restrictedToLevel.color}
          />
        )}
        {service.restrictedToLevel
          ? service.restrictedToLevel.name
          : "All levels"}
      </Badge>
      {service.maxRiders === 1 && (
        <Badge variant="outline">
          <AlertCircleIcon />
          Private
        </Badge>
      )}
    </div>
  </div>
);
