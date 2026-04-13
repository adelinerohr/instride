import {
  boardsOptions,
  levelOptions,
  membersOptions,
  servicesOptions,
  useCreateLessonSeries,
} from "@instride/api";
import { RecurrenceFrequency } from "@instride/shared";
import { getUser } from "@instride/utils";
import { useStore } from "@tanstack/react-form";
import { useQueries } from "@tanstack/react-query";
import { CircleIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogHandler,
  DialogPortal,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  InputGroupAddon,
  InputGroupText,
} from "@/shared/components/ui/input-group";
import { Item, ItemContent, ItemMedia } from "@/shared/components/ui/item";
import { Switch } from "@/shared/components/ui/switch";
import { useAppForm } from "@/shared/hooks/form";

import { lessonFormOpts } from "../../lib/new-lesson.form";

type InitialValues = {
  start?: string;
  boardId?: string;
  trainerId?: string;
};

export const newLessonModalHandler =
  DialogHandler.createHandle<InitialValues>();

export function NewLessonModal() {
  return (
    <Dialog handle={newLessonModalHandler}>
      {({ payload }) => (
        <DialogPortal>
          {payload && <NewLessonModalForm {...payload} />}
        </DialogPortal>
      )}
    </Dialog>
  );
}

export function NewLessonModalForm(initialValues: InitialValues) {
  const [showCustomDetails, setShowCustomDetails] = React.useState(false);
  const createLesson = useCreateLessonSeries();

  const form = useAppForm({
    ...lessonFormOpts,
    defaultValues: {
      ...lessonFormOpts.defaultValues,
      start: initialValues.start ?? "",
      boardId: initialValues.boardId ?? "",
      trainerId: initialValues.trainerId ?? "",
    },
    onSubmit: ({ value }) => {
      console.log(value);

      createLesson.mutateAsync(
        {
          ...value,
          recurrenceFrequency: isRecurring ? RecurrenceFrequency.WEEKLY : null,
          effectiveFrom: new Date().toISOString(),
          riderIds: value.riderIds.map((rider) => rider.id),
        },
        {
          onSuccess: () => {
            toast.success("Lesson created successfully");
            newLessonModalHandler.close();
          },
          onError: () => {
            toast.error("Failed to create lesson");
          },
        }
      );
    },
  });

  // ---- Cascading field values ----
  const boardId = useStore(form.store, (s) => s.values.boardId);
  const trainerId = useStore(form.store, (s) => s.values.trainerId);
  const isRecurring = useStore(form.store, (s) => s.values.isRecurring);

  // ---- Data queries (cascade: board → trainer → service) ----
  const { boards, trainers, levels, services, riders, isPending } = useQueries({
    queries: [
      boardsOptions.list(),
      membersOptions.trainers(),
      levelOptions.list(),
      servicesOptions.all(),
      membersOptions.riders(),
    ],
    combine: (results) => ({
      boards: results[0].data ?? [],
      trainers: results[1].data ?? [],
      levels: results[2].data ?? [],
      services: results[3].data ?? [],
      riders: results[4].data ?? [],
      isPending: results.some((r) => r.isPending),
    }),
  });

  if (isPending) return null;

  const currentBoard = boards.find((board) => board.id === boardId);

  const filteredTrainers = trainers.filter((trainer) =>
    currentBoard?.assignments?.some(
      (assignment) => assignment.trainerId === trainer.id
    )
  );
  const filteredServices = services.filter((service) =>
    service.trainerAssignments?.some(
      (assignment) => assignment.trainerId === trainerId
    )
  );

  return (
    <DialogContent className="min-w-3xl w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <DialogHeader>
          <DialogTitle>New Lesson</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <form.AppField
            name="boardId"
            listeners={{
              onChange: () => {
                form.setFieldValue("trainerId", "");
                form.setFieldValue("serviceId", "");
              },
            }}
            children={(field) => (
              <field.SelectField
                items={boards ?? []}
                itemToValue={(board) => board.id}
                label="Board"
                placeholder="Select a board"
                renderValue={(board) => board.name}
              />
            )}
          />
          <form.AppField
            name="trainerId"
            listeners={{
              onChange: () => {
                form.setFieldValue("serviceId", "");
              },
            }}
            children={(field) => (
              <field.SelectField
                items={filteredTrainers ?? []}
                itemToValue={(trainer) => trainer.id}
                label="Trainer"
                placeholder="Select a trainer"
                renderValue={(value) => (
                  <Item size="xs" className="w-full p-0">
                    <ItemMedia>
                      <UserAvatar user={getUser({ trainer: value })} />
                    </ItemMedia>
                    <ItemContent>
                      {getUser({ trainer: value }).name}
                    </ItemContent>
                  </Item>
                )}
              />
            )}
          />
          <form.AppField
            name="start"
            children={(field) => <field.DatetimeField label="Start" />}
          />
          <form.AppField
            name="serviceId"
            listeners={{
              onChange: ({ value }) => {
                const service = services?.find(
                  (service) => service.id === value
                );
                if (!service) return;

                form.setFieldValue("duration", service.duration);
                form.setFieldValue("maxRiders", service.maxRiders);
                if (service.isRestricted) {
                  form.setFieldValue("levelId", service.restrictedToLevelId);
                }
              },
            }}
            children={(field) => (
              <field.SelectField
                items={filteredServices ?? []}
                itemToValue={(service) => service.id}
                label="Service"
                placeholder="Select a service"
                renderValue={(service) => service.name}
              />
            )}
          />
          <form.AppField
            name="levelId"
            children={(field) => (
              <field.ClearableSelectField
                items={levels ?? []}
                itemToValue={(level) => level?.id ?? null}
                label="Level"
                placeholder="Unrestricted"
                clearableLabel="Unrestricted"
                fieldClassName="w-full"
                renderValue={(level) => (
                  <div className="flex items-center gap-2">
                    <CircleIcon
                      className="size-3"
                      fill={level?.color}
                      stroke={level?.color}
                    />
                    {level?.name}
                  </div>
                )}
              />
            )}
          />
          <form.AppField
            name="isRecurring"
            children={(field) => <field.SwitchField label="Is Recurring" />}
          />
          <div className="flex items-center justify-between rounded-lg border p-4">
            <span className="text-sm font-medium">
              Customize lesson name and notes
            </span>
            <Switch
              checked={showCustomDetails}
              onCheckedChange={setShowCustomDetails}
            />
          </div>
          {showCustomDetails && (
            <>
              <form.AppField
                name="name"
                children={(field) => <field.TextField label="Name" />}
              />
              <form.AppField
                name="notes"
                children={(field) => <field.TextareaField label="Notes" />}
              />
            </>
          )}
          <form.AppField
            name="duration"
            children={(field) => (
              <field.TextField
                type="number"
                step={15}
                label="Duration"
                inputGroup
                inputMode="numeric"
              >
                <InputGroupAddon align="inline-end">
                  <InputGroupText>minutes</InputGroupText>
                </InputGroupAddon>
              </field.TextField>
            )}
          />
          <form.AppField
            name="maxRiders"
            children={(field) => (
              <field.TextField
                type="number"
                inputMode="numeric"
                step={1}
                min={1}
                max={10}
                label="Max Riders"
              />
            )}
          />
          <form.AppField
            name="riderIds"
            children={(field) => (
              <field.MultiSelectField
                items={riders ?? []}
                itemToValue={(rider) => rider.id}
                itemToLabel={(rider) => getUser({ rider }).name}
                renderValue={(rider) => (
                  <Item size="xs" className="w-full p-0">
                    <ItemMedia>
                      <UserAvatar user={getUser({ rider })} />
                    </ItemMedia>
                    <ItemContent>{getUser({ rider }).name}</ItemContent>
                  </Item>
                )}
                label="Riders"
                placeholder="Select riders"
              />
            )}
          />
        </div>
        <DialogFooter>
          <form.AppForm>
            <form.SubmitButton
              label="Create Lesson"
              loadingLabel="Creating Lesson..."
            />
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
