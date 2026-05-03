import { useCreateTimeBlock, useTrainers } from "@instride/api";
import { isValidStrings, formPartsToIso } from "@instride/shared";
import { useRouteContext } from "@tanstack/react-router";
import { formatDuration, intervalToDuration } from "date-fns";
import { AlertCircleIcon, CalendarIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

import {
  buildCreateTimeBlockDefaultValues,
  createTimeBlockFormOpts,
  validateEndAfterStart,
} from "@/features/organization/lib/forms/time-block";
import { Button } from "@/shared/components/ui/button";
import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/shared/components/ui/item";
import { useAppForm } from "@/shared/hooks/use-form";

import {
  CreateTimeBlockModal,
  type CreateTimeBlockModalPayload,
} from "./modal";

export function CreateTimeBlockForm({
  initialValues,
  isOnlyTrainer,
  trainerId,
}: CreateTimeBlockModalPayload) {
  const modal = CreateTimeBlockModal.useModal();
  const { organization } = useRouteContext({
    from: "/org/$slug/(authenticated)",
  });

  const { data: trainers = [] } = useTrainers();
  const createTimeBlock = useCreateTimeBlock();

  const effectiveTrainers = React.useMemo(() => {
    if (isOnlyTrainer) {
      return trainers.filter((trainer) => trainer.id === trainerId) ?? [];
    }
    if (initialValues?.trainerId) {
      return (
        trainers.filter((trainer) => trainer.id === initialValues.trainerId) ??
        []
      );
    }
    return trainers;
  }, [isOnlyTrainer, trainers, trainerId, initialValues?.trainerId]);

  const form = useAppForm({
    ...createTimeBlockFormOpts,
    defaultValues: buildCreateTimeBlockDefaultValues({
      initialValues: {
        start: initialValues?.start,
        trainerId: isOnlyTrainer ? trainerId : initialValues?.trainerId,
      },
      timezone: organization.timezone,
    }),
    onSubmit: async ({ value }) => {
      createTimeBlock.mutateAsync(
        {
          trainerId: value.trainerId,
          start: formPartsToIso(value.start, organization.timezone),
          end: formPartsToIso(value.end, organization.timezone),
          reason:
            value.reason && value.reason.trim().length > 0
              ? value.reason
              : null,
        },
        {
          onSuccess: () => {
            toast.success("Time block created successfully.");
            modal.close();
          },
          onError: (error) => {
            toast.error("Failed to create time block.");
            console.error(error);
          },
        }
      );
    },
  });

  return (
    <DialogContent className="sm:max-w-lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <DialogHeader>
          <DialogTitle>New time block</DialogTitle>
          <DialogDescription>
            Mark a trainer as unavailable. The blocked period won't be available
            for lessons.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form.AppField name="trainerId">
            {(field) => (
              <field.TrainerSelectField trainers={effectiveTrainers} />
            )}
          </form.AppField>
          <form.AppField
            name="start.date"
            listeners={{
              onChange: ({ value }) => {
                form.setFieldValue("end.date", value);
              },
            }}
          >
            {(field) => <field.DateField label="Date" icon={CalendarIcon} />}
          </form.AppField>
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="start.time">
              {(field) => <field.TextField type="time" label="Start time" />}
            </form.AppField>
            <form.AppField
              name="end.time"
              validators={{
                onChangeListenTo: ["start.time"],
                onChange: ({ value, fieldApi }) => {
                  const start = fieldApi.form.getFieldValue("start");
                  const endDate = fieldApi.form.getFieldValue("end.date");

                  return validateEndAfterStart({
                    start,
                    end: { date: endDate, time: value },
                    timezone: organization.timezone,
                  });
                },
              }}
            >
              {(field) => <field.TextField type="time" label="End time" />}
            </form.AppField>
          </div>
          <form.Subscribe
            selector={(state) => [state.values.start, state.values.end]}
          >
            {([start, end]) => {
              if (
                !isValidStrings([start.date, start.time, end.date, end.time])
              ) {
                return null;
              }

              const startDate = new Date(
                formPartsToIso(start, organization.timezone)
              );
              const endDate = new Date(
                formPartsToIso(end, organization.timezone)
              );

              const duration = formatDuration(
                intervalToDuration({ start: startDate, end: endDate }),
                {
                  format: ["hours", "minutes"],
                }
              );
              console.log(duration);
              return (
                <Item className="bg-category-sage-bg text-category-sage-fg">
                  <ItemMedia variant="icon">
                    <AlertCircleIcon />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      Blocks <span className="font-bold">{duration}</span>
                    </ItemTitle>
                    <ItemDescription className="text-xs text-category-sage-fg">
                      Conflicts with 0 lessons
                    </ItemDescription>
                  </ItemContent>
                </Item>
              );
            }}
          </form.Subscribe>
          <form.AppField name="reason">
            {(field) => (
              <field.TextareaField
                label="Reason"
                optional
                placeholder="e.g. Doctor's appointment, personal day..."
              />
            )}
          </form.AppField>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <form.AppForm>
            <form.SubmitButton label="Create time block" />
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
