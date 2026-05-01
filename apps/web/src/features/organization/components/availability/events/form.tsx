import {
  APIError,
  useBoards,
  useCreateEvent,
  useTrainers,
  useUpdateEvent,
} from "@instride/api";
import { EventScope } from "@instride/shared";
import {
  BanIcon,
  BuildingIcon,
  CalendarIcon,
  ClipboardIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  buildDefaultEventValues,
  eventFormOpts,
} from "@/features/organization/lib/forms/event-form";
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
  FieldContent,
  FieldDescription,
  FieldError,
  FieldTitle,
} from "@/shared/components/ui/field";
import {
  Field,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/shared/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Separator } from "@/shared/components/ui/separator";
import { Switch } from "@/shared/components/ui/switch";
import { useAppForm, withFieldGroup } from "@/shared/hooks/use-form";

import { EventModal, type EventModalPayload } from "./modal";

const scopeOptions = [
  {
    label: "Organization",
    value: EventScope.ORGANIZATION,
    icon: BuildingIcon,
    description: "Everyone in the barn",
  },
  {
    label: "Board",
    value: EventScope.BOARD,
    icon: ClipboardIcon,
    description: "Members of one board",
  },
  {
    label: "Trainer",
    value: EventScope.TRAINER,
    icon: UsersIcon,
    description: "Specific trainer(s)",
  },
];

export function EventModalForm({ event: initialEvent }: EventModalPayload) {
  const modal = EventModal.useModal();

  const { data: trainers = [] } = useTrainers();
  const { data: boards = [] } = useBoards();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const form = useAppForm({
    ...eventFormOpts,
    defaultValues: buildDefaultEventValues(initialEvent),
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
        if (initialEvent?.id) {
          await updateEvent.mutateAsync({
            id: initialEvent.id,
            request: payload,
          });
          toast.success("Event updated successfully");
          modal.close();
        } else {
          await createEvent.mutateAsync(payload);
          toast.success("Event created successfully");
          modal.close();
        }
      } catch (error) {
        const message =
          error instanceof APIError ? error.message : "Request failed";
        toast.error(message);
      }
    },
  });

  return (
    <DialogContent className="sm:max-w-2xl">
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
          <form.AppField name="title">
            {(field) => <field.TextField label="Title" />}
          </form.AppField>
          <form.AppField name="description">
            {(field) => (
              <field.TextareaField
                optional
                label="Description"
                placeholder="Add details riders should know (i.e. what to bring, etc.)"
              />
            )}
          </form.AppField>
          <form.AppField
            name="scope"
            listeners={{
              onChange: ({ value, fieldApi }) => {
                if (value === EventScope.BOARD) {
                  fieldApi.form.setFieldValue("trainerIds", []);
                } else if (value === EventScope.TRAINER) {
                  fieldApi.form.setFieldValue("boardIds", []);
                } else {
                  fieldApi.form.setFieldValue("boardIds", []);
                  fieldApi.form.setFieldValue("trainerIds", []);
                }
              },
            }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <FieldSet>
                  <FieldLegend variant="label">
                    Who will this event affect?
                  </FieldLegend>
                  <RadioGroup
                    name={field.name}
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    {scopeOptions.map((scope) => (
                      <FieldLabel htmlFor={scope.value} key={scope.value}>
                        <Field
                          orientation="horizontal"
                          data-invalid={isInvalid}
                        >
                          <FieldContent>
                            <FieldTitle>
                              <scope.icon className="size-4" />
                              {scope.label}
                            </FieldTitle>
                            <FieldDescription className="text-xs">
                              {scope.description}
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem
                            value={scope.value}
                            id={scope.value}
                            aria-invalid={isInvalid}
                            className="hidden"
                          />
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </FieldSet>
              );
            }}
          </form.AppField>
          <form.Subscribe selector={(state) => state.values.scope}>
            {(scope) => {
              if (scope === EventScope.ORGANIZATION) return null;

              if (scope === EventScope.BOARD) {
                return (
                  <form.AppField name="boardIds">
                    {(field) => (
                      <field.SelectField
                        items={boards}
                        placeholder="Select a board"
                        itemToValue={(board) => board.id}
                        renderValue={(board) => board.name}
                      />
                    )}
                  </form.AppField>
                );
              }

              if (scope === EventScope.TRAINER) {
                return (
                  <form.AppField name="trainerIds">
                    {(field) => (
                      <field.TrainerSelectField
                        hideLabel
                        trainers={trainers}
                        multiple
                        placeholder="Select trainer(s)"
                      />
                    )}
                  </form.AppField>
                );
              }
            }}
          </form.Subscribe>
          <form.AppField name="blockScheduling">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <FieldLabel
                  htmlFor={field.name}
                  className="bg-muted/50 has-data-checked:bg-category-amber-bg has-data-checked:border-category-amber-border has-data-checked:text-category-amber-fg"
                >
                  <Field orientation="horizontal" data-invalid={isInvalid}>
                    <div className="size-8 bg-white group-has-data-checked/field:bg-category-amber-border group-has-data-checked/field:border-category-amber-border group-has-data-checked/field:text-category-amber-fg rounded-md flex items-center justify-center">
                      <BanIcon className="size-4" />
                    </div>
                    <FieldContent>
                      <FieldTitle>
                        Block scheduling during this event
                      </FieldTitle>
                      <FieldDescription className="text-xs group-has-data-checked/field:text-category-amber-fg">
                        No new lessons can be booked during this event. All
                        existing lessons will be cancelled.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id={field.name}
                      name={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                      aria-invalid={isInvalid}
                    />
                  </Field>
                </FieldLabel>
              );
            }}
          </form.AppField>
          <FieldSet>
            <FieldLegend variant="label">When</FieldLegend>
            <div className="space-y-4 p-4 border rounded-lg">
              <WhenFieldGroup form={form} fields="start" label="Starts" />
              <Separator />
              <WhenFieldGroup form={form} fields="end" label="Ends" />
            </div>
          </FieldSet>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <form.AppForm>
            <form.SubmitButton label="Create event" />
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

const WhenFieldGroup = withFieldGroup({
  defaultValues: {
    date: "",
    time: null as string | null,
    allDay: false,
  },
  props: {
    label: "",
  },
  render: function Render({ group, label }) {
    return (
      <div className="grid grid-cols-10 gap-8 items-center">
        <span className="font-medium col-span-1">{label}</span>
        <div className="flex items-center gap-4 flex-1 col-span-9">
          <group.AppField name="date">
            {(field) => (
              <field.DateField fieldClassName="flex-1" icon={CalendarIcon} />
            )}
          </group.AppField>
          <group.AppField name="time">
            {(field) => (
              <group.Subscribe selector={(state) => state.values.allDay}>
                {(allDay) => (
                  <field.TextField
                    type="time"
                    key={allDay ? "all-day" : "timed"}
                    className="w-[120px]"
                    disabled={allDay}
                  />
                )}
              </group.Subscribe>
            )}
          </group.AppField>
          <group.AppField
            name="allDay"
            listeners={{
              onChange: ({ value }) => {
                if (value === true) {
                  group.setFieldValue("time", "");
                }
              },
            }}
          >
            {(field) => (
              <field.CheckboxField
                label="All Day"
                fieldClassName="w-fit"
                labelClassName="whitespace-nowrap"
              />
            )}
          </group.AppField>
        </div>
      </div>
    );
  },
});
