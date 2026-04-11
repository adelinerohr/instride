import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { CheckboxField } from "@/shared/components/form/checkbox-field";
import { ClearableSelectField } from "@/shared/components/form/clearable-select-field";
import { ColorPickerField } from "@/shared/components/form/color-picker-field";
import { DatetimeField } from "@/shared/components/form/datetime-field";
import { MultiSelectField } from "@/shared/components/form/multiselect-field";
import { PhoneField } from "@/shared/components/form/phone-field";
import { SelectField } from "@/shared/components/form/select-field";
import { SubmitButton } from "@/shared/components/form/submit-button";
import { SwitchField } from "@/shared/components/form/switch-field";
import { TextField } from "@/shared/components/form/text-field";
import { TextareaField } from "@/shared/components/form/textarea-field";

import { BooleanRadioField } from "../components/form/radio-field";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    TextField,
    SelectField,
    ClearableSelectField,
    SwitchField,
    TextareaField,
    DatetimeField,
    MultiSelectField,
    PhoneField,
    ColorPickerField,
    CheckboxField,
    BooleanRadioField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});
