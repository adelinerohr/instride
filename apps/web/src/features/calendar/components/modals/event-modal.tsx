import {
  APIError,
  useBoards,
  useCreateEvent,
  useTrainers,
  useUpdateEvent,
  type types,
} from "@instride/api";
import { eventInputSchema, EventScope } from "@instride/shared";
import { getUser } from "@instride/shared";
import * as React from "react";
import { toast } from "sonner";

import { UserAvatarItem } from "@/shared/components/fragments/user-avatar";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHandler,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/shared/components/ui/field";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAppForm } from "@/shared/hooks/use-form";

export const eventModalHandler =
  DialogHandler.createHandle<types.GetEventResponse | null>();

export function EventModal() {
  return (
    <Dialog handle={eventModalHandler}>
      {({ payload }) => (
        <DialogPortal>
          <EventModalForm {...(payload ?? {})} />
        </DialogPortal>
      )}
    </Dialog>
  );
}

export function EventModalForm(props?: Partial<types.GetEventResponse>) {
  const [startFullDay, setStartFullDay] = React.useState(
    props?.event?.startTime === null
  );
  const [endFullDay, setEndFullDay] = React.useState(
    props?.event?.endTime === null
  );

  const { data: boards, isPending: isBoardsPending } = useBoards();
  const { data: trainers, isPending: isTrainersPending } = useTrainers();

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const form = useAppForm({
    defaultValues: {
      title: props?.event?.title ?? "",
      description: props?.event?.description ?? null,
      startDate: props?.event?.startDate ?? "",
      endDate: props?.event?.endDate ?? "",
      startTime: props?.event?.startTime ?? null,
      endTime: props?.event?.endTime ?? null,
      scope: props?.scope ?? EventScope.ORGANIZATION,
      boardIds: props?.boardIds ?? [],
      trainerIds: props?.trainerIds ?? [],
      blockScheduling: props?.event?.blockScheduling ?? false,
    },
    validators: {
      onSubmit: eventInputSchema,
    },
    onSubmitInvalid: ({ value }) => {
      const parsed = eventInputSchema.safeParse(value);
      if (!parsed.success) {
        console.log(parsed.error);
      }
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      if (props?.event) {
        updateEvent.mutateAsync(
          {
            id: props.event.id,
            request: {
              ...value,
              boardIds: value.boardIds.length > 0 ? value.boardIds : null,
              trainerIds: value.trainerIds.length > 0 ? value.trainerIds : null,
            },
          },
          {
            onSuccess: () => {
              toast.success("Event updated successfully");
              eventModalHandler.close();
            },
            onError: (error) => {
              toast.error(
                error instanceof APIError
                  ? error.message
                  : "Failed to update event"
              );
            },
          }
        );
      } else {
        createEvent.mutateAsync(
          {
            ...value,
            boardIds: value.boardIds.length > 0 ? value.boardIds : null,
            trainerIds: value.trainerIds.length > 0 ? value.trainerIds : null,
          },
          {
            onSuccess: () => {
              toast.success("Event created successfully");
              eventModalHandler.close();
            },
            onError: (error) => {
              toast.error(
                error instanceof APIError
                  ? error.message
                  : "Failed to create event"
              );
            },
          }
        );
      }
    },
  });

  if (!boards || !trainers) return null;

  if (isBoardsPending || isTrainersPending)
    return <Skeleton className="w-full h-full" />;

  return (
    <DialogContent className="max-w-lg! w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <DialogHeader>
          <DialogTitle>{props?.event?.title ?? "New Event"}</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <form.AppField
            name="title"
            children={(field) => (
              <field.TextField label="Title" className="w-full" />
            )}
          />
          <form.AppField
            name="description"
            children={(field) => (
              <field.TextareaField label="Description" className="w-full" />
            )}
          />
          <form.AppField
            name="scope"
            listeners={{
              onChange: ({ value }) => {
                if (value === EventScope.TRAINER) {
                  form.setFieldValue("boardIds", []);
                } else if (value === EventScope.BOARD) {
                  form.setFieldValue("trainerIds", []);
                }
              },
            }}
            children={(field) => (
              <field.SelectField
                label="Scope"
                items={Object.values(EventScope).map((scope) => ({
                  label: scope.charAt(0).toUpperCase() + scope.slice(1),
                  value: scope,
                }))}
                itemToValue={(scope) => scope.value}
                renderValue={(scope) => scope.label}
              />
            )}
          />
          <form.Subscribe selector={(state) => state.values.scope}>
            {(scope) =>
              scope === EventScope.BOARD && (
                <form.AppField
                  name="boardIds"
                  children={(field) => (
                    <field.MultiSelectField
                      label="Board"
                      placeholder="Select a board"
                      items={boards}
                      itemToValue={(board) => board.id}
                      itemToLabel={(board) => board.name}
                      renderValue={(board) => board.name}
                    />
                  )}
                />
              )
            }
          </form.Subscribe>
          <form.Subscribe selector={(state) => state.values.scope}>
            {(scope) =>
              scope === EventScope.TRAINER && (
                <form.AppField
                  name="trainerIds"
                  children={(field) => (
                    <field.MultiSelectField
                      label="Trainers"
                      placeholder="Select a trainer"
                      items={trainers}
                      itemToValue={(trainer) => trainer.id}
                      itemToLabel={(trainer) => getUser({ trainer }).name}
                      renderValue={(trainer) => (
                        <UserAvatarItem user={getUser({ trainer })} />
                      )}
                    />
                  )}
                />
              )
            }
          </form.Subscribe>
          <form.AppField
            name="blockScheduling"
            children={(field) => (
              <field.SwitchField label="Block Scheduling" className="w-full" />
            )}
          />
          <FieldSeparator />

          <Field className="w-fit" orientation="horizontal">
            <Checkbox
              checked={startFullDay}
              onCheckedChange={setStartFullDay}
            />
            <FieldLabel className="w-fit whitespace-nowrap">
              Full Day?
            </FieldLabel>
          </Field>
          <div className="flex items-start gap-4">
            <form.AppField
              name="startDate"
              children={(field) => (
                <field.DateField label="Start Date" className="w-full" />
              )}
            />
            <form.AppField
              name="startTime"
              listeners={{
                onChange: () => {
                  if (startFullDay) form.setFieldValue("startTime", null);
                },
              }}
              children={(field) =>
                !startFullDay && (
                  <field.TextField type="time" label="Start Time" />
                )
              }
            />
          </div>
          <FieldSeparator />
          <Field className="w-fit" orientation="horizontal">
            <Checkbox checked={endFullDay} onCheckedChange={setEndFullDay} />
            <FieldLabel className="w-fit whitespace-nowrap">
              Full Day?
            </FieldLabel>
          </Field>
          <div className="flex items-start gap-4">
            <form.AppField
              name="endDate"
              children={(field) => (
                <field.DateField label="End Date" className="w-full" />
              )}
            />

            <form.AppField
              name="endTime"
              listeners={{
                onChange: () => {
                  if (endFullDay) form.setFieldValue("endTime", null);
                },
              }}
              children={(field) =>
                !endFullDay && <field.TextField type="time" label="End Time" />
              }
            />
          </div>
        </FieldGroup>
        <DialogFooter>
          <form.AppForm>
            <form.SubmitButton label="Save" loadingLabel="Saving..." />
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
