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
  trainers: types.Trainer[];
  placeholder?: string;
  className?: string;
  hideLabel?: boolean;
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

const renderValue = (trainer: types.Trainer) => {
  const trainerUser = getUser({ trainer });
  return <UserAvatarItem user={trainerUser} />;
};

export function TrainerSelectField({
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
  trainers,
  placeholder,
  className,
  description,
  hideLabel = false,
}: Omit<SingleSelectFieldProps, "clearable">) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const currentItem = trainers.find(
    (trainers) => trainers.id === field.state.value
  );

  return (
    <Field data-invalid={isInvalid} className={className}>
      {!hideLabel && <FieldLabel>Trainer</FieldLabel>}
      <Select
        name={field.name}
        value={currentItem}
        itemToStringValue={(trainer) => trainer.id}
        onValueChange={(trainer) =>
          field.handleChange(trainer ? trainer.id : "")
        }
      >
        <SelectTrigger className="h-auto!">
          <SelectValue placeholder={placeholder ?? "Select a trainer"}>
            {currentItem
              ? (value: types.Trainer | null) =>
                  value != null ? renderValue(value) : null
              : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {trainers.map((trainer) => (
            <SelectItem key={trainer.id} value={trainer}>
              {renderValue(trainer)}
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
  trainers,
  placeholder,
  className,
  hideLabel = false,
  description,
}: Omit<MultiSelectFieldProps, "clearable" | "multiple">) {
  const anchor = useComboboxAnchor();
  const field = useFieldContext<string[]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const currentItems = trainers.filter((trainer) =>
    field.state.value.includes(trainer.id)
  );

  return (
    <Field data-invalid={isInvalid} className={className}>
      {!hideLabel && <FieldLabel>Trainers</FieldLabel>}
      <Combobox
        value={currentItems}
        onValueChange={(value) => {
          field.handleChange((value as types.Trainer[]).map((v) => v.id));
        }}
        multiple
        autoHighlight
        items={trainers}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(values) => (
              <React.Fragment>
                {values.map((value: types.Trainer) => (
                  <ComboboxChip key={value.id}>
                    {getUser({ trainer: value }).name}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={field.name}
                  name={field.name}
                  placeholder={placeholder ?? "Select trainers"}
                  aria-invalid={isInvalid}
                />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No trainers found</ComboboxEmpty>
          <ComboboxList>
            {(trainer: types.Trainer) => (
              <ComboboxItem key={trainer.id} value={trainer}>
                {renderValue(trainer)}
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
  trainers,
  placeholder,
  className,
  disabled,
  disabledHint,
  clearableLabel,
  hideLabel = false,
  description,
}: Omit<ClearableSingleSelectFieldProps, "clearable">) {
  const field = useFieldContext<string | null>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errors = field.state.meta.errors;

  const currentItem =
    trainers.find((trainer) => trainer.id === field.state.value) ?? null;

  return (
    <Field data-invalid={isInvalid}>
      {!hideLabel && <FieldLabel>Trainer</FieldLabel>}
      <Select
        name={field.name}
        value={currentItem}
        itemToStringValue={(trainer) => trainer.id}
        onValueChange={(trainer) =>
          field.handleChange(trainer ? trainer.id : null)
        }
      >
        <SelectTrigger
          className={cn(
            className,
            disabled && disabledHint && "opacity-50 w-full"
          )}
        >
          <SelectValue placeholder={placeholder ?? "Select a trainer"}>
            {currentItem
              ? (trainer: types.Trainer) => renderValue(trainer)
              : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectItem value={null}>{placeholder ?? clearableLabel}</SelectItem>
          {trainers.map((trainer) => (
            <SelectItem key={trainer.id} value={trainer}>
              {renderValue(trainer)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}
