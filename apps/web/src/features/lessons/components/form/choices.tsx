import {
  boardsOptions,
  membersOptions,
  servicesOptions,
  levelOptions,
} from "@instride/api";
import { getUser } from "@instride/shared";
import { useStore } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PencilIcon, XIcon, CircleIcon } from "lucide-react";
import * as React from "react";

import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
} from "@/shared/components/ui/collapsible";
import { FieldGroup } from "@/shared/components/ui/field";
import {
  InputGroupAddon,
  InputGroupText,
} from "@/shared/components/ui/input-group";
import { Item, ItemContent, ItemMedia } from "@/shared/components/ui/item";
import { withForm } from "@/shared/hooks/use-form";

import { lessonFormOpts } from "../../lib/new-lesson.form";

export const LessonChoicesFormSection = withForm({
  ...lessonFormOpts,
  props: {
    canProceed: false as boolean,
  },
  render: ({ form, canProceed }) => {
    const { data: boards, isLoading: isLoadingBoards } = useSuspenseQuery(
      boardsOptions.list()
    );
    const { data: trainers, isLoading: isLoadingTrainers } = useSuspenseQuery(
      membersOptions.trainers()
    );
    const { data: services, isLoading: isLoadingServices } = useSuspenseQuery(
      servicesOptions.all()
    );
    const { data: levels } = useSuspenseQuery(levelOptions.list());

    const [isOpen, setIsOpen] = React.useState(true);

    const boardId = useStore(form.store, (state) => state.values.boardId);
    const trainerId = useStore(form.store, (state) => state.values.trainerId);
    const serviceId = useStore(form.store, (state) => state.values.serviceId);

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card>
          <CardHeader>
            <CardTitle>Lesson Options</CardTitle>
            <CardDescription>
              Select a board and trainer to get the available services.
            </CardDescription>
            {!isOpen && (
              <CardAction>
                <Button onClick={() => setIsOpen(true)}>
                  Edit
                  <PencilIcon />
                </Button>
              </CardAction>
            )}
            {isOpen && canProceed && (
              <CardAction>
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  Close
                  <XIcon />
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CollapsibleContent className="space-y-4">
            <CardContent>
              <FieldGroup>
                <form.AppField
                  name="boardId"
                  children={(field) => (
                    <field.SelectField
                      label="Board"
                      placeholder="Select a board"
                      className="w-full"
                      emptyPlaceholder="No boards available"
                      disabled={isLoadingBoards}
                      items={boards}
                      itemToValue={(board) => board?.id ?? null}
                      renderValue={(value) => value?.name}
                    />
                  )}
                />
                <form.AppField
                  name="trainerId"
                  children={(field) => (
                    <field.SelectField
                      label="Trainer"
                      placeholder="Select a trainer"
                      fieldClassName="w-full"
                      disabled={!boardId || isLoadingTrainers}
                      items={trainers}
                      itemToValue={(trainer) => trainer?.id ?? null}
                      renderValue={(value) => (
                        <Item size="xs" className="w-full p-0">
                          <ItemMedia>
                            <UserAvatar user={getUser({ trainer: value })} />
                          </ItemMedia>
                          <ItemContent>
                            {value?.member?.authUser?.name}
                          </ItemContent>
                        </Item>
                      )}
                    />
                  )}
                />
                <form.AppField
                  name="serviceId"
                  listeners={{
                    onChange: ({ value }) => {
                      const service = services?.find((s) => s.id === value);
                      if (!service) return;
                      form.setFieldValue(
                        "maxRiders",
                        service.isPrivate ? 1 : service.maxRiders
                      );
                      form.setFieldValue("duration", service.duration);
                      form.setFieldValue(
                        "levelId",
                        service.restrictedToLevelId
                          ? service.restrictedToLevelId
                          : ""
                      );
                    },
                  }}
                  children={(field) => (
                    <field.SelectField
                      label="Service"
                      placeholder="Select a service"
                      emptyPlaceholder="No services available"
                      fieldClassName="w-full"
                      disabled={!boardId || !trainerId || isLoadingServices}
                      items={services}
                      itemToValue={(service) => service?.id}
                      renderValue={(value) => value?.name}
                    />
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form.AppField
                    name="maxRiders"
                    children={(field) => (
                      <field.TextField
                        label="Max Riders"
                        type="number"
                        step={1}
                        inputGroup
                      >
                        <InputGroupAddon align="inline-end">
                          <InputGroupText>riders</InputGroupText>
                        </InputGroupAddon>
                      </field.TextField>
                    )}
                  />
                  <form.AppField
                    name="levelId"
                    children={(field) => (
                      <field.ClearableSelectField
                        label="Level"
                        placeholder="Unrestricted"
                        clearableLabel="Unrestricted"
                        fieldClassName="w-full"
                        disabled={true}
                        disabledHint={
                          serviceId
                            ? "Levels are restricted to the selected service"
                            : "Select a service first"
                        }
                        items={levels}
                        itemToValue={(level) => level?.id ?? null}
                        renderValue={(value) => (
                          <div className="flex items-center gap-2">
                            <CircleIcon
                              className="size-3"
                              fill={value?.color}
                              stroke={value?.color}
                            />
                            {value?.name}
                          </div>
                        )}
                      />
                    )}
                  />
                </div>
              </FieldGroup>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setIsOpen(false)}
                disabled={!canProceed}
                className="ml-auto"
              >
                Next
              </Button>
            </CardFooter>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  },
});
