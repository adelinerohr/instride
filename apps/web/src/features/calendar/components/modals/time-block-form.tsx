import {
  useCreateTimeBlock,
  useDeleteTimeBlock,
  useUpdateTimeBlock,
  type types,
} from "@instride/api";
import { format } from "date-fns";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHandler,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { FieldGroup } from "@/shared/components/ui/field";
import { useAppForm } from "@/shared/hooks/form";

import { useCalendar } from "../../hooks/use-calendar";

function toLocalInputValue(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export const timeBlockModalHandler = DialogHandler.createHandle<{
  timeBlock: types.TimeBlock;
  defaultStart?: Date;
  defaultEnd?: Date;
  defaultTrainerId?: string;
}>();

export function TimeBlockModal() {
  return (
    <Dialog handle={timeBlockModalHandler}>
      {({ payload }) => (
        <DialogPortal>
          {payload && <TimeBlockModalForm {...payload} />}
        </DialogPortal>
      )}
    </Dialog>
  );
}

interface TimeBlockModalFormProps {
  timeBlock?: types.TimeBlock;
  defaultStart?: Date;
  defaultEnd?: Date;
  defaultTrainerId?: string;
}

export function TimeBlockModalForm({
  timeBlock,
  defaultStart,
  defaultEnd,
  defaultTrainerId,
}: TimeBlockModalFormProps) {
  const { trainers } = useCalendar();
  const createTimeBlock = useCreateTimeBlock();
  const updateTimeBlock = useUpdateTimeBlock({ timeBlock });
  const deleteTimeBlock = useDeleteTimeBlock({ timeBlock });
  const isEdit = !!timeBlock;

  const initialStart = timeBlock?.start
    ? toLocalInputValue(new Date(timeBlock.start))
    : defaultStart
      ? toLocalInputValue(defaultStart)
      : "";

  const initialEnd = timeBlock?.end
    ? toLocalInputValue(new Date(timeBlock.end))
    : defaultEnd
      ? toLocalInputValue(defaultEnd)
      : "";

  const form = useAppForm({
    defaultValues: {
      trainerId: timeBlock?.trainerId ?? defaultTrainerId ?? "",
      start: initialStart,
      end: initialEnd,
      reason: timeBlock?.reason ?? null,
    },
    validators: {
      onSubmit: z
        .object({
          trainerId: z.string().min(1, "Please select a trainer."),
          start: z.string().min(1),
          end: z.string().min(1),
          reason: z.string().nullable(),
        })
        .refine((data) => {
          const startDate = new Date(data.start);
          const endDate = new Date(data.end);

          if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
          ) {
            return "Please enter valid dates.";
          }

          if (endDate <= startDate) {
            return "End time must be after start time.";
          }

          return true;
        }),
    },
    onSubmit: ({ value }) => {
      if (isEdit && timeBlock) {
        updateTimeBlock.mutateAsync(
          { id: timeBlock.id, request: value },
          {
            onSuccess: () => {
              toast.success("Time block updated successfully.");
              timeBlockModalHandler.close();
            },
            onError: (error) => {
              toast.error("Failed to update time block.");
              console.error(error);
            },
          }
        );
      } else {
        createTimeBlock.mutateAsync(value, {
          onSuccess: () => {
            toast.success("Time block created successfully.");
            timeBlockModalHandler.close();
          },
          onError: (error) => {
            toast.error("Failed to create time block.");
            console.error(error);
          },
        });
      }
    },
  });

  const handleDelete = React.useCallback(() => {
    if (!timeBlock) return;

    deleteTimeBlock.mutate(timeBlock.id, {
      onSuccess: () => {
        toast.success("Time block deleted successfully.");
        timeBlockModalHandler.close();
      },
      onError: (error) => {
        toast.error("Failed to delete time block.");
        console.error(error);
      },
    });
  }, [timeBlock, deleteTimeBlock]);

  return (
    <DialogContent className="max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Time Block" : "New Time Block"}
          </DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <form.AppField
            name="trainerId"
            children={(field) => (
              <field.SelectField
                label="Trainer"
                description="Select the trainer for this time block"
                items={trainers.map((trainer) => ({
                  label: trainer.member?.authUser?.name ?? "",
                  value: trainer.id,
                }))}
              />
            )}
          />
          <form.AppField
            name="start"
            children={(field) => <field.DatetimeField label="Start" />}
          />
          <form.AppField
            name="end"
            children={(field) => <field.DatetimeField label="End" />}
          />
          <form.AppField
            name="reason"
            children={(field) => <field.TextareaField label="Reason" />}
          />
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          {isEdit && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTimeBlock.isPending}
            >
              Delete
            </Button>
          )}
          <form.AppForm>
            <form.SubmitButton label="Save changes" loadingLabel="Saving..." />
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
