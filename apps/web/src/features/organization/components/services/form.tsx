import type { types } from "@instride/api";
import { getUser } from "@instride/utils";
import { useStore } from "@tanstack/react-form";
import { PlusIcon, XIcon, CoinsIcon, CircleIcon } from "lucide-react";
import * as React from "react";

import { UserAvatarItem } from "@/shared/components/fragments/user-avatar";
import { Button } from "@/shared/components/ui/button";
import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
} from "@/shared/components/ui/field";
import {
  InputGroupAddon,
  InputGroupText,
} from "@/shared/components/ui/input-group";
import { withForm } from "@/shared/hooks/form";

import { serviceFormOpts } from "../../lib/service.form";

export const ServiceForm = withForm({
  ...serviceFormOpts,
  props: {
    boards: [] as types.Board[],
    trainers: [] as types.Trainer[],
    levels: [] as types.Level[],
  },
  render: ({ form, boards, trainers, levels }) => {
    const selectedBoardIds = useStore(form.store, (s) => s.values.boardIds);
    const selectedTrainerIds = useStore(form.store, (s) => s.values.trainerIds);
    const isPrivate = useStore(form.store, (s) => s.values.isPrivate);
    const isRestricted = useStore(form.store, (s) => s.values.isRestricted);

    const availableBoards = React.useMemo(() => {
      const ids = selectedBoardIds.map((b) => b.id).filter(Boolean);
      return boards.filter((b) => !ids.includes(b.id));
    }, [boards, selectedBoardIds]);

    const availableTrainers = React.useMemo(() => {
      const ids = selectedTrainerIds.map((t) => t.id).filter(Boolean);
      return trainers.filter((t) => !ids.includes(t.id));
    }, [trainers, selectedTrainerIds]);

    return (
      <FieldGroup className="flex flex-col gap-4">
        {/* Basic info */}
        <FieldGroup className="rounded-md border bg-card p-4 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          <form.AppField
            name="name"
            children={(field) => (
              <field.TextField
                label="Service Name"
                placeholder="Private Lesson, Flat Lesson, Training Ride..."
              />
            )}
          />
          <form.AppField
            name="description"
            children={(field) => (
              <field.TextareaField
                label="Description"
                placeholder="Describe the service"
              />
            )}
          />
        </FieldGroup>

        {/* Boards */}
        <FieldGroup className="rounded-md border bg-card p-4 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Boards</h2>
          <form.Field name="boardIds" mode="array">
            {(field) => (
              <FieldSet className="gap-4">
                <FieldDescription>
                  Choose which boards will offer this service.
                </FieldDescription>
                <FieldGroup className="gap-3">
                  {field.state.value.map((_, index) => (
                    <form.AppField
                      key={index}
                      name={`boardIds[${index}].id`}
                      children={(subField) => (
                        <div className="flex items-center gap-2">
                          <subField.SelectField
                            placeholder="Select a board"
                            items={boards}
                            itemToValue={(board) => board.id}
                            renderValue={(board) => board.name}
                          />
                          {subField.state.value.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => subField.removeValue(index)}
                            >
                              <XIcon />
                            </Button>
                          )}
                        </div>
                      )}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={availableBoards.length === 0}
                    onClick={() => field.pushValue({ id: "" })}
                  >
                    <PlusIcon /> Add board
                  </Button>
                </FieldGroup>
                {field.state.meta.isTouched && !field.state.meta.isValid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </FieldSet>
            )}
          </form.Field>
        </FieldGroup>

        {/* Trainers */}
        <FieldGroup className="rounded-md border bg-card p-4 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Trainers</h2>
          <form.Field name="trainerIds" mode="array">
            {(field) => (
              <FieldSet className="gap-4">
                <FieldDescription>
                  Choose which trainers can perform this service.
                </FieldDescription>
                <FieldGroup className="gap-3">
                  {field.state.value.map((_, index) => (
                    <form.AppField
                      key={index}
                      name={`trainerIds[${index}].id`}
                      children={(subField) => (
                        <div className="flex items-center gap-2">
                          <subField.SelectField
                            placeholder="Select a trainer"
                            items={trainers}
                            itemToValue={(trainer) => trainer.id}
                            renderValue={(trainer) => {
                              const user = getUser({ member: trainer.member! });
                              return <UserAvatarItem user={user} />;
                            }}
                          />
                          {subField.state.value.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => subField.removeValue(index)}
                            >
                              <XIcon />
                            </Button>
                          )}
                        </div>
                      )}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={availableTrainers.length === 0}
                    onClick={() => field.pushValue({ id: "" })}
                  >
                    <PlusIcon /> Add trainer
                  </Button>
                </FieldGroup>
                {field.state.meta.isTouched && !field.state.meta.isValid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </FieldSet>
            )}
          </form.Field>
        </FieldGroup>

        {/* Pricing */}
        <FieldGroup className="rounded-md border bg-card p-4 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Pricing</h2>
          <form.AppField
            name="price"
            children={(field) => (
              <field.TextField
                type="number"
                label="Price"
                placeholder="0"
                inputGroup
              >
                <InputGroupAddon align="inline-start">
                  <InputGroupText>$</InputGroupText>
                </InputGroupAddon>
              </field.TextField>
            )}
          />
          <form.AppField
            name="creditPrice"
            children={(field) => (
              <field.TextField
                type="number"
                label="Price in credits"
                placeholder="0"
                inputGroup
              >
                <InputGroupAddon align="inline-start">
                  <CoinsIcon className="size-4" />
                </InputGroupAddon>
              </field.TextField>
            )}
          />
          <form.AppField
            name="creditAdditionalPrice"
            children={(field) => (
              <field.TextField
                type="number"
                label="Additional charge when using credits"
                placeholder="0"
                inputGroup
              >
                <InputGroupAddon align="inline-start">
                  <InputGroupText>$</InputGroupText>
                </InputGroupAddon>
              </field.TextField>
            )}
          />
        </FieldGroup>

        {/* Booking Conditions */}
        <FieldGroup className="rounded-md border bg-card p-4 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Booking Conditions</h2>
          <form.AppField
            name="isPrivate"
            children={(field) => (
              <field.SwitchField
                label="Make service private"
                onCheckedChange={(checked) => {
                  field.handleChange(checked);
                  if (checked) form.setFieldValue("maxRiders", 1);
                }}
              />
            )}
          />
          <form.AppField
            name="canRecurBook"
            children={(field) => (
              <field.SwitchField label="Allow riders to book recurring lessons" />
            )}
          />
          <form.AppField
            name="canRiderAdd"
            children={(field) => (
              <field.SwitchField label="Allow riders to add this lesson to the schedule" />
            )}
          />
          <form.AppField
            name="isRestricted"
            children={(field) => (
              <field.SwitchField label="Restrict booking to riders with specific levels" />
            )}
          />
          {isRestricted && (
            <form.AppField
              name="restrictedToLevelId"
              children={(field) => (
                <field.SelectField
                  placeholder="Select a level"
                  items={levels}
                  itemToValue={(level) => level.id}
                  renderValue={(level) => (
                    <div className="flex items-center gap-2">
                      <CircleIcon stroke={level.color} fill={level.color} />
                      <span>{level.name}</span>
                    </div>
                  )}
                />
              )}
            />
          )}
          {!isPrivate && (
            <form.AppField
              name="maxRiders"
              children={(field) => (
                <field.TextField
                  type="number"
                  label="Maximum Riders"
                  placeholder="1"
                />
              )}
            />
          )}
          <form.AppField
            name="duration"
            children={(field) => (
              <field.TextField
                type="number"
                label="Duration (minutes)"
                placeholder="30"
                inputGroup
              >
                <InputGroupAddon align="inline-end">
                  <InputGroupText>minutes</InputGroupText>
                </InputGroupAddon>
              </field.TextField>
            )}
          />
        </FieldGroup>
      </FieldGroup>
    );
  },
});
