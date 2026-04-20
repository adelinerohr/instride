import { getUser, type types } from "@instride/api";
import * as React from "react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useFieldContext } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

import { UserAvatarItem } from "../../fragments/user-avatar";
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
} from "../../ui/combobox";

interface BaseProps {
  riders: types.Rider[];
  placeholder?: string;
  className?: string;
  hideLabel?: boolean;
  label?: string;
  description?: string;
}

interface ClearableSingleSelectFieldProps extends BaseProps {
  clearable?: true;
  multiple?: false;
  disabled?: boolean;
  disabledHint?: string;
  clearableLabel?: string;
}

interface SingleSelectFieldProps extends BaseProps {
  clearable?: false;
  multiple?: false;
}

interface MultiSelectFieldProps extends BaseProps {
  multiple?: true;
  clearable?: false;
}

type Props =
  | ClearableSingleSelectFieldProps
  | SingleSelectFieldProps
  | MultiSelectFieldProps;

const renderValue = (rider: types.Rider) => {
  const riderUser = getUser({ rider });
  return <UserAvatarItem user={riderUser} />;
};

export function RiderSelectField({
  clearable = false,
  multiple = false,
  ...props
}: Props) {
  if (clearable) {
    return <ClearableSingleSelectField {...props} />;
  }

  if (multiple) {
    return <MultiSelectField {...props} />;
  }

  return <SingleSelectField {...props} />;
}

function SingleSelectField({
  riders,
  placeholder,
  className,
  label,
  description,
  hideLabel = false,
}: Omit<SingleSelectFieldProps, "clearable">) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const currentItem = riders.find((rider) => rider.id === field.state.value);

  return (
    <Field data-invalid={isInvalid} className={className}>
      {!hideLabel && <FieldLabel>{label ?? "Rider"}</FieldLabel>}
      <Select
        name={field.name}
        value={currentItem}
        itemToStringValue={(rider) => rider.id}
        onValueChange={(rider) => field.handleChange(rider ? rider.id : "")}
      >
        <SelectTrigger className="h-auto!">
          <SelectValue placeholder={placeholder ?? "Select a rider"}>
            {currentItem
              ? (value: types.Rider | null) =>
                  value != null ? renderValue(value) : null
              : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {riders.map((rider) => (
            <SelectItem key={rider.id} value={rider}>
              {renderValue(rider)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}

function MultiSelectField({
  riders,
  placeholder,
  className,
  hideLabel = false,
  label,
  description,
}: Omit<MultiSelectFieldProps, "clearable" | "multiple">) {
  const anchor = useComboboxAnchor();
  const field = useFieldContext<string[]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const currentItems = riders.filter((rider) =>
    field.state.value.includes(rider.id)
  );

  return (
    <Field data-invalid={isInvalid} className={className}>
      {!hideLabel && <FieldLabel>{label ?? "Riders"}</FieldLabel>}
      <Combobox
        value={currentItems}
        onValueChange={(value) => {
          field.handleChange((value as types.Rider[]).map((v) => v.id));
        }}
        multiple
        autoHighlight
        items={riders}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(values) => (
              <React.Fragment>
                {values.map((value: types.Rider) => (
                  <ComboboxChip key={value.id}>
                    {getUser({ rider: value }).name}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={field.name}
                  name={field.name}
                  placeholder={placeholder ?? "Select riders"}
                  aria-invalid={isInvalid}
                />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No riders found</ComboboxEmpty>
          <ComboboxList>
            {(rider: types.Rider) => (
              <ComboboxItem key={rider.id} value={rider}>
                {renderValue(rider)}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}

function ClearableSingleSelectField({
  riders,
  placeholder,
  className,
  disabled,
  disabledHint,
  clearableLabel,
  hideLabel = false,
  label,
  description,
}: Omit<ClearableSingleSelectFieldProps, "clearable">) {
  const field = useFieldContext<string | null>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const currentItem =
    riders.find((rider) => rider.id === field.state.value) ?? null;

  return (
    <Field data-invalid={isInvalid}>
      {!hideLabel && <FieldLabel>{label ?? "Rider"}</FieldLabel>}
      <Select
        name={field.name}
        value={currentItem}
        itemToStringValue={(rider) => rider.id}
        onValueChange={(rider) => field.handleChange(rider ? rider.id : null)}
      >
        <SelectTrigger
          className={cn(
            className,
            disabled && disabledHint && "opacity-50 w-full"
          )}
        >
          <SelectValue placeholder={placeholder ?? "Select a rider"}>
            {currentItem
              ? (rider: types.Rider) => renderValue(rider)
              : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectItem value={null}>{placeholder ?? clearableLabel}</SelectItem>
          {riders.map((rider) => (
            <SelectItem key={rider.id} value={rider}>
              {renderValue(rider)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
