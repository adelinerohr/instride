import {
  APIError,
  useCreateEvent,
  useTrainers,
  useUpdateEvent,
  getUser,
  useBoards,
  type Event,
} from "@instride/api";
import { eventInputSchema, EventScope } from "@instride/shared";
import { useStore } from "@tanstack/react-store";
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
import { useAppForm, withFieldGroup } from "@/shared/hooks/use-form";

import { buildDefaultEventValues, eventFormOpts } from "../../lib/event.form";

export const eventModalHandler = DialogHandler.createHandle<Event | null>();

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

function EventModalForm(props?: Partial<Event>) {
  const { data: boards, isPending: isBoardsPending } = useBoards();
  const { data: trainers, isPending: isTrainersPending } = useTrainers();

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const form = useAppForm({
    ...eventFormOpts,
    defaultValues: buildDefaultEventValues(props),
    onSubmitInvalid: ({ value }) => {
      const parsed = eventInputSchema.safeParse(value);
      if (!parsed.success) {
        console.log(parsed.error);
      }
    },
    onSubmit: async ({ value }) => {
      const payload = {
        ...value,
        startDate: value.start.date,
        endDate: value.end.date,
        startTime: value.start.time,
        endTime: value.end.time,
        boardIds: value.boardIds.length > 0 ? value.boardIds : null,
        trainerIds: value.trainerIds.length > 0 ? value.trainerIds : null,
      };

      try {
        if (props?.id) {
          await updateEvent.mutateAsync({ id: props.id, request: payload });
          toast.success("Event updated successfully");
        } else {
          await createEvent.mutateAsync(payload);
          toast.success("Event created successfully");
        }
      } catch (error) {
        const message =
          error instanceof APIError ? error.message : "Request failed";
        toast.error(message);
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
          <DialogTitle>{props?.title ?? "New Event"}</DialogTitle>
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
                } else {
                  form.setFieldValue("boardIds", []);
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
            {(scope) => {
              if (scope === EventScope.BOARD) {
                return (
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
                );
              }
              if (scope === EventScope.TRAINER) {
                return (
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
                );
              }
              return null;
            }}
          </form.Subscribe>
          <form.AppField
            name="blockScheduling"
            children={(field) => (
              <field.SwitchField label="Block Scheduling" className="w-full" />
            )}
          />
          <FieldSeparator />
          <DateTimeFieldGroup
            form={form}
            fields="start"
            label="Start Date"
            timeLabel="Start Time"
          />
          <FieldSeparator />
          <DateTimeFieldGroup
            form={form}
            fields="end"
            label="End Date"
            timeLabel="End Time"
          />
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

const DateTimeFieldGroup = withFieldGroup({
  defaultValues: {
    date: "",
    time: null as string | null,
  },
  props: {
    label: "Date" as string,
    timeLabel: "Time" as string,
  },
  render: function Render({ group, label, timeLabel }) {
    const time = useStore(group.store, (s) => s.values.time);
    const isFullDay = time === null;

    return (
      <>
        <Field className="w-fit" orientation="horizontal">
          <Checkbox
            checked={isFullDay}
            onCheckedChange={(checked) => {
              group.setFieldValue("time", checked ? null : "");
            }}
          />
          <FieldLabel className="w-fit whitespace-nowrap">Full Day?</FieldLabel>
        </Field>
        <div className="flex items-start gap-4">
          <group.AppField
            name="date"
            children={(field) => (
              <field.DateField label={label} className="w-full" />
            )}
          />
          {!isFullDay && (
            <group.AppField
              name="time"
              children={(field) => (
                <field.TextField type="time" label={timeLabel} />
              )}
            />
          )}
        </div>
      </>
    );
  },
});
