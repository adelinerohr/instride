import type { types } from "@instride/api";
import { getUser } from "@instride/shared";
import { useStore } from "@tanstack/react-form";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleIcon,
} from "lucide-react";

import { lessonFormOpts } from "@/features/lessons/lib/new-lesson.form";
import { UserAvatarItem } from "@/shared/components/fragments/user-avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { withForm } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

export const SchedulingSection = withForm({
  ...lessonFormOpts,
  props: {
    boards: [] as types.Board[],
    trainers: [] as types.Trainer[],
    services: [] as types.Service[],
    levels: [] as types.Level[],
    isOpen: true as boolean,
    onOpenChange: (_open: boolean) => {},
  },
  render: ({
    form,
    boards,
    trainers,
    services,
    levels,
    isOpen,
    onOpenChange,
  }) => {
    const boardId = useStore(form.store, (s) => s.values.boardId);
    const trainerId = useStore(form.store, (s) => s.values.trainerId);
    const serviceId = useStore(form.store, (s) => s.values.serviceId);
    const start = useStore(form.store, (s) => s.values.start);

    const isComplete = !!(boardId && trainerId && serviceId && start);

    const currentBoard = boards.find((board) => board.id === boardId);
    const currentTrainer = trainers.find((trainer) => trainer.id === trainerId);
    const currentService = services.find((service) => service.id === serviceId);

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

    // Summary text when collapsed
    const boardName = currentBoard?.name ?? "Board";
    const trainerName = getUser({ trainer: currentTrainer }).name ?? "Trainer";
    const serviceName = currentService?.name ?? "Service";

    return (
      <Collapsible
        className="rounded-lg border"
        open={isOpen}
        onOpenChange={onOpenChange}
      >
        <CollapsibleTrigger
          render={
            <button className="flex w-full items-center justify-between px-4 py-3" />
          }
        >
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2Icon className="size-4 text-emerald-500" />
            ) : (
              <CalendarIcon className="size-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">Scheduling</span>
            {!isOpen && isComplete && (
              <span className="ml-2 text-xs text-muted-foreground">
                {boardName} · {trainerName} · {serviceName}
              </span>
            )}
          </div>
          <ChevronDownIcon
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 border-t p-4">
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
                  <UserAvatarItem user={getUser({ trainer: value })} />
                )}
              />
            )}
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
        </CollapsibleContent>
      </Collapsible>
    );
  },
});
