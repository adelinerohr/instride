import {
  checkTrainerAvailability,
  type AvailabilityResult,
  type Board,
  type Event,
  type LessonInstance,
  type Service,
  type TimeBlock,
} from "@instride/api";
import {
  type EffectiveBusinessHours,
  type TrainerEffectiveBusinessHours,
} from "@instride/shared";
import { useStore } from "@tanstack/react-form";
import { formatInTimeZone } from "date-fns-tz";
import { AlertCircleIcon, TicketIcon, UserIcon, UsersIcon } from "lucide-react";
import * as React from "react";

import { quickCreateLessonFormOpts } from "@/features/lessons/lib/quick-create.form";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/shared/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { withForm } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

interface Props {
  board: Board | undefined;
  services: Service[];
  startDate: Date;
  timezone: string;
  riderLevelId?: string | null;
  calendarCtx: {
    organizationBusinessHours: EffectiveBusinessHours;
    trainerBusinessHours: TrainerEffectiveBusinessHours;
    events: Event[];
    timeBlocks: TimeBlock[];
    lessons: LessonInstance[];
  };
}

export const ServiceStep = withForm({
  ...quickCreateLessonFormOpts,
  props: {} as Props,
  render: ({
    form,
    board,
    services,
    startDate,
    timezone,
    riderLevelId,
    calendarCtx,
  }) => {
    const selectedTrainerId = useStore(form.store, (s) => s.values.trainerId);
    const type = useStore(form.store, (s) => s.values.type);

    const serviceOptions = React.useMemo(() => {
      if (!board || !selectedTrainerId) return [];

      const activeBoardServiceIds = new Set(
        board.serviceBoardAssignments
          .filter((sba) => sba.isActive)
          .map((sba) => sba.serviceId)
      );

      const eligibleServices = services.filter((s) => {
        if (!activeBoardServiceIds.has(s.id)) return false;
        if (!s.isActive || (type === "rider" && !s.canRiderAdd)) return false;
        if (!s.isAllTrainers) {
          const trainerOK = s.trainerAssignments.some(
            (a) => a.trainerId === selectedTrainerId && a.isActive
          );
          if (!trainerOK) return false;
        }
        if (
          type === "rider" &&
          s.isRestricted &&
          s.restrictedToLevelId !== riderLevelId
        ) {
          return false;
        }
        return true;
      });

      const trainerHours = calendarCtx.trainerBusinessHours[selectedTrainerId];
      if (!trainerHours) {
        return eligibleServices.map((service) => ({
          service,
          availability: {
            ok: false as const,
            reason: "Trainer hours not loaded",
          } satisfies AvailabilityResult,
        }));
      }

      return eligibleServices.map((service) => ({
        service,
        availability: checkTrainerAvailability({
          start: startDate,
          durationMinutes: service.duration,
          trainerId: selectedTrainerId,
          boardId: board.id,
          trainerBusinessHours: trainerHours,
          organizationBusinessHours: calendarCtx.organizationBusinessHours,
          events: calendarCtx.events,
          timeBlocks: calendarCtx.timeBlocks,
          lessons: calendarCtx.lessons,
          timezone,
        }),
      }));
    }, [
      board,
      services,
      selectedTrainerId,
      riderLevelId,
      startDate,
      calendarCtx,
      timezone,
    ]);

    return (
      <div className="space-y-3">
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <TicketIcon className="size-4" />
          Pick a service for the time
          <span className="font-medium text-foreground">
            {formatInTimeZone(startDate, timezone, "h:mm a")}.
          </span>
          Duration must fit the trainer&apos;s window.
        </p>

        <form.Field
          name="serviceId"
          listeners={{
            onChange: ({ value }) => {
              if (type !== "rider") return;

              const service = services.find((s) => s.id === value);
              if (!service) return;

              const isGroup = !service.isPrivate && service.maxRiders > 1;
              form.setFieldValue("isServiceGroup", isGroup);
              form.setFieldValue(
                "acknowledgePrivateLesson",
                isGroup ? null : false
              );
            },
          }}
        >
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <FieldSet>
                <RadioGroup
                  name={field.name}
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  {serviceOptions.map(({ service, availability }) => {
                    const unavailable = !availability.ok;
                    const isPrivate =
                      service.isPrivate || service.maxRiders === 1;

                    return (
                      <FieldLabel htmlFor={service.id} key={service.id}>
                        <Field
                          orientation="horizontal"
                          data-invalid={isInvalid}
                          className={cn(
                            "items-center!",
                            !availability.ok && "opacity-50"
                          )}
                        >
                          <RadioGroupItem
                            value={service.id}
                            id={service.id}
                            aria-invalid={isInvalid}
                            disabled={!availability.ok}
                          />
                          <FieldContent className="flex-row justify-between items-center">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {service.name}
                                </span>
                                {isPrivate ? (
                                  <Badge variant="secondary">
                                    <UserIcon />
                                    Private
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">
                                    <UsersIcon />
                                    Group
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {!isPrivate &&
                                  `Up to ${service.maxRiders} riders · `}
                                {service.duration} minutes
                              </span>
                              {unavailable && (
                                <span className="block text-xs text-destructive mt-0.5">
                                  {availability.reason}
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-semibold">
                              ${service.price}
                            </span>
                          </FieldContent>
                        </Field>
                      </FieldLabel>
                    );
                  })}
                </RadioGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </FieldSet>
            );
          }}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.serviceId}>
          {(serviceId) => {
            if (type !== "rider") return null;

            const service = services.find((s) => s.id === serviceId);
            if (!service) return null;

            const isGroup = !service.isPrivate && service.maxRiders > 1;
            if (!isGroup) return null;

            return (
              <form.Field name="acknowledgePrivateLesson">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <FieldSet>
                      <FieldLabel className="border-destructive! bg-destructive/10!">
                        <Field orientation="horizontal">
                          <AlertCircleIcon className="text-destructive size-4.5" />
                          <Checkbox
                            id={field.name}
                            name={field.name}
                            checked={field.state.value ?? false}
                            onCheckedChange={(value) =>
                              field.handleChange(value === true)
                            }
                            className="bg-white border-destructive"
                          />
                          <FieldContent>
                            <FieldTitle>
                              I understand this becomes a private lesson if no
                              one else joins
                            </FieldTitle>
                            <FieldDescription className="text-xs">
                              Group lessons need at least 2 riders. If you're
                              the only one signed up at the lesson start, it
                              converts to a private and will be charged as such.
                            </FieldDescription>
                          </FieldContent>
                        </Field>
                      </FieldLabel>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldSet>
                  );
                }}
              </form.Field>
            );
          }}
        </form.Subscribe>
      </div>
    );
  },
});
