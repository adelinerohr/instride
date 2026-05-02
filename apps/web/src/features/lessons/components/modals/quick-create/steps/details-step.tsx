import { useLevels, type Service } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import { RepeatIcon } from "lucide-react";

import { quickCreateLessonFormOpts } from "@/features/lessons/lib/quick-create.form";
import { CategoryDot } from "@/shared/components/fragments/category-dot";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/shared/components/ui/field";
import { Switch } from "@/shared/components/ui/switch";
import { withForm } from "@/shared/hooks/use-form";

export const DetailsStep = withForm({
  ...quickCreateLessonFormOpts,
  props: {
    services: [] as Service[],
  },
  render: ({ form, services }) => {
    const { data: levels = [] } = useLevels();

    const serviceId = useStore(form.store, (state) => state.values.serviceId);
    const type = useStore(form.store, (state) => state.values.type);

    if (type === "rider") {
      return null;
    }

    const selectedService = services.find(
      (service) => service.id === serviceId
    );

    if (!selectedService) {
      return null;
    }

    return (
      <div className="space-y-3">
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          All optional. Skip and confirm, or add finishing touches.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.AppField
            name="details.name"
            children={(field) => <field.TextField label="Name" optional />}
          />
          <form.AppField
            name="details.levelId"
            children={(field) => (
              <field.ClearableSelectField
                label="Restricted to level"
                items={levels}
                placeholder="Unrestricted"
                clearableLabel="Unrestricted"
                itemToValue={(level) => level?.id ?? null}
                renderValue={(level) => (
                  <div className="flex items-center gap-2">
                    <CategoryDot color={level?.color} size="sm" />
                    {level?.name}
                  </div>
                )}
              />
            )}
          />
        </div>
        <form.AppField
          name="details.notes"
          children={(field) => <field.TextareaField label="Notes" optional />}
        />
        <form.Field name="details.isRecurring">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <FieldLabel>
                <Field
                  orientation="horizontal"
                  data-invalid={isInvalid}
                  className="bg-muted/50"
                >
                  <RepeatIcon className="size-3.5 text-muted-foreground mt-0.5" />
                  <FieldContent>
                    <FieldTitle>Recurring</FieldTitle>
                    <FieldDescription className="text-xs">
                      Repeats at this same day & time every week.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    checked={field.state.value ?? false}
                    onCheckedChange={field.handleChange}
                    aria-invalid={isInvalid}
                  />
                </Field>
              </FieldLabel>
            );
          }}
        </form.Field>
      </div>
    );
  },
});
