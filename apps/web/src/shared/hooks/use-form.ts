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

import { DateField } from "../components/form/date-field";
import { BooleanRadioField } from "../components/form/radio-field";
import { PasswordField } from "../components/form/variants/password-field";
import { ServiceSelectField } from "../components/form/variants/service-select-field";
import { TrainerSelectField } from "../components/form/variants/trainer-select-field";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    TextField,
    DateField,
    SelectField,
    ClearableSelectField,
    SwitchField,
    TextareaField,
    DatetimeField,
    MultiSelectField,
    PhoneField,
    PasswordField,
    ColorPickerField,
    TrainerSelectField,
    CheckboxField,
    BooleanRadioField,
    ServiceSelectField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});
