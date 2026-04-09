import type { types } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import { PlusIcon } from "lucide-react";
import { XIcon } from "lucide-react";
import * as React from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  FieldDescription,
  FieldGroup,
  FieldSet,
  FieldError,
  FieldContent,
  Field,
} from "@/shared/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { withForm } from "@/shared/hooks/form";
import { getInitials } from "@/shared/lib/utils/format";

import { boardFormOpts } from "../../lib/board.form";

export const BoardForm = withForm({
  ...boardFormOpts,
  props: {
    trainers: [] as types.Trainer[],
    services: [] as types.Service[],
  },
  render: ({ form, trainers, services }) => {
    const selectedTrainerIds = useStore(
      form.store,
      (state) => state.values.trainerIds
    );
    const selectedServiceIds = useStore(
      form.store,
      (state) => state.values.serviceIds
    );

    const availableTrainers = React.useMemo(() => {
      const selectedIds = selectedTrainerIds
        .map((trainer) => trainer.id)
        .filter(Boolean);
      return trainers.filter((trainer) => !selectedIds.includes(trainer.id));
    }, [trainers, selectedTrainerIds]);

    const availableServices = React.useMemo(() => {
      const selectedIds = selectedServiceIds
        .map((service) => service.id)
        .filter(Boolean);
      return services.filter((service) => !selectedIds.includes(service.id));
    }, [services, selectedServiceIds]);

    const getCurrentTrainerOptions = (
      trainers: types.Trainer[],
      currentValue: string
    ) => {
      return trainers.filter((trainer) => {
        const isSelected = selectedTrainerIds
          .map((t) => t.id)
          .includes(trainer.id);
        return trainer.id === currentValue || !isSelected;
      });
    };

    return (
      <FieldGroup className="flex flex-col gap-4">
        {/* Basic info */}
        <FieldGroup className="rounded-md border bg-card p-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          <form.AppField
            name="name"
            children={(field) => (
              <field.TextField
                label="Board Name"
                placeholder="School Barn, Boarder Lessons..."
              />
            )}
          />
          <form.AppField
            name="canRiderAdd"
            children={(field) => (
              <field.SwitchField
                label="Riders can add lessons"
                description="Allow riders to add lessons to this board"
              />
            )}
          />
        </FieldGroup>

        {/* Trainers */}
        <FieldGroup className="rounded-md border bg-card p-4">
          <h2 className="text-xl font-semibold">Trainers</h2>
          <form.Field name="trainerIds" mode="array">
            {(field) => (
              <FieldSet>
                <FieldDescription>
                  Choose which trainers will be available for this board.
                </FieldDescription>
                <FieldGroup className="gap-3">
                  {field.state.value.map((_, index) => (
                    <form.Field
                      key={index}
                      name={`trainerIds[${index}].id`}
                      children={(subField) => {
                        const isInvalid =
                          subField.state.meta.isTouched &&
                          !subField.state.meta.isValid;
                        return (
                          <Field
                            orientation="horizontal"
                            data-invalid={isInvalid}
                          >
                            <FieldContent>
                              <div className="flex items-center gap-2 w-full">
                                <Select
                                  name={subField.name}
                                  onValueChange={(value) =>
                                    subField.handleChange(String(value))
                                  }
                                  value={subField.state.value}
                                >
                                  <SelectTrigger
                                    className="flex-1"
                                    id={subField.name}
                                    aria-invalid={isInvalid}
                                    disabled={form.state.isSubmitting}
                                  >
                                    <SelectValue>
                                      {(value: string) => {
                                        const trainer = trainers.find(
                                          (t) => t.id === value
                                        );

                                        if (!trainer) {
                                          return <span>Select a trainer</span>;
                                        }

                                        return (
                                          <div className="flex items-center gap-2">
                                            <Avatar size="sm">
                                              <AvatarImage
                                                src={
                                                  trainer?.member?.authUser
                                                    ?.image ?? undefined
                                                }
                                              />
                                              <AvatarFallback>
                                                {getInitials(
                                                  trainer?.member?.authUser
                                                    ?.name
                                                )}
                                              </AvatarFallback>
                                            </Avatar>
                                            {trainer?.member?.authUser?.name}
                                          </div>
                                        );
                                      }}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent alignItemWithTrigger={false}>
                                    {getCurrentTrainerOptions(
                                      trainers,
                                      subField.state.value
                                    ).map((trainer) => (
                                      <SelectItem
                                        key={trainer.id}
                                        value={trainer.id}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Avatar size="sm">
                                            <AvatarImage
                                              src={
                                                trainer.member?.authUser
                                                  ?.image ?? undefined
                                              }
                                            />
                                            <AvatarFallback>
                                              {getInitials(
                                                trainer.member?.authUser?.name
                                              )}
                                            </AvatarFallback>
                                          </Avatar>
                                          {trainer.member?.authUser?.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {field.state.value.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => field.removeValue(index)}
                                  >
                                    <XIcon />
                                  </Button>
                                )}
                              </div>
                              {isInvalid && (
                                <FieldError
                                  errors={subField.state.meta.errors}
                                />
                              )}
                            </FieldContent>
                          </Field>
                        );
                      }}
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

        {/* Services — same pattern as trainers */}
        <FieldGroup className="rounded-md border bg-card p-4">
          <h2 className="text-xl font-semibold">Services</h2>
          <form.Field name="serviceIds" mode="array">
            {(field) => (
              <FieldSet>
                <FieldDescription>
                  Choose which services will be available for this board.
                </FieldDescription>
                <FieldGroup className="gap-3">
                  {field.state.value.map((_, index) => (
                    <form.AppField
                      key={index}
                      name={`serviceIds[${index}].id`}
                      children={(subField) => (
                        <div className="flex items-center gap-2">
                          <subField.SelectField
                            placeholder="Select a service"
                            items={availableServices.map((service) => ({
                              label: service.name ?? "",
                              value: service.id,
                            }))}
                          />
                          {field.state.value.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => field.removeValue(index)}
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
                    disabled={availableServices.length === 0}
                    onClick={() => field.pushValue({ id: "" })}
                  >
                    <PlusIcon /> Add service
                  </Button>
                </FieldGroup>
              </FieldSet>
            )}
          </form.Field>
        </FieldGroup>
      </FieldGroup>
    );
  },
});
