import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { DatetimeField } from "@/components/form/datetime-field";
import { MultiSelectField } from "@/components/form/multi-select-field";
import { SelectField } from "@/components/form/select-field";
import { SubmitButton } from "@/components/form/submit-button";
import { TextField } from "@/components/form/text-field";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    SelectField,
    MultiSelectField,
    TextField,
    DatetimeField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});
