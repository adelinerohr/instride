import type {
  Board,
  Event,
  LessonInstance,
  Service,
  TimeBlock,
} from "@instride/api";
import { checkTrainerAvailability } from "@instride/api";
import type {
  EffectiveBusinessHours,
  TrainerEffectiveBusinessHours,
} from "@instride/shared";
import { formatInTimeZone } from "date-fns-tz";
import { UserIcon } from "lucide-react";
import * as React from "react";

import { quickCreateLessonFormOpts } from "@/features/lessons/lib/quick-create.form";
import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSet,
} from "@/shared/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { withForm } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

interface Props {
  board: Board | undefined;
  startDate: Date;
  timezone: string;
  calendarCtx: {
    organizationBusinessHours: EffectiveBusinessHours;
    trainerBusinessHours: TrainerEffectiveBusinessHours;
    events: Event[];
    timeBlocks: TimeBlock[];
    lessons: LessonInstance[];
  };
  services: Service[];
}

export const TrainerStep = withForm({
  ...quickCreateLessonFormOpts,
  props: {} as Props,
  render: ({ form, board, startDate, timezone, calendarCtx, services }) => {
    const trainerOptions = React.useMemo(() => {
      if (!board) return [];
      const minDuration =
        services.length > 0 ? Math.min(...services.map((s) => s.duration)) : 30;

      return board.assignments
        .filter((a) => a.trainer !== null)
        .map((a) => {
          const trainer = a.trainer!;
          const hours = calendarCtx.trainerBusinessHours[trainer.id];
          if (!hours) {
            return {
              trainer,
              availability: {
                ok: false as const,
                reason: "Trainer hours not loaded",
              },
            };
          }
          return {
            trainer,
            availability: checkTrainerAvailability({
              start: startDate,
              durationMinutes: minDuration,
              trainerId: trainer.id,
              boardId: board.id,
              trainerBusinessHours: hours,
              organizationBusinessHours: calendarCtx.organizationBusinessHours,
              events: calendarCtx.events,
              timeBlocks: calendarCtx.timeBlocks,
              lessons: calendarCtx.lessons,
              timezone,
            }),
          };
        });
    }, [board, services, startDate, calendarCtx, timezone]);

    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserIcon className="h-4 w-4" />
          Pick a trainer for{" "}
          <span className="font-medium text-foreground">
            {formatInTimeZone(startDate, timezone, "h:mm a")}
          </span>
        </p>

        <form.Field name="trainerId">
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
                  {trainerOptions.map(({ trainer, availability }) => (
                    <FieldLabel htmlFor={trainer.id} key={trainer.id}>
                      <Field
                        orientation="horizontal"
                        data-invalid={isInvalid}
                        className={cn(
                          "items-center!",
                          !availability.ok && "opacity-50"
                        )}
                      >
                        <FieldContent className="flex-row gap-2 items-center">
                          <UserAvatar user={trainer.member.authUser} />
                          <div className="flex flex-col">
                            <span className="truncate text-sm font-medium leading-tight">
                              {trainer.member.authUser.name}
                            </span>
                            {!availability.ok && (
                              <span className="text-xs text-destructive">
                                {availability.reason}
                              </span>
                            )}
                          </div>
                        </FieldContent>
                        <RadioGroupItem
                          value={trainer.id}
                          id={trainer.id}
                          aria-invalid={isInvalid}
                          disabled={!availability.ok}
                        />
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </FieldSet>
            );
          }}
        </form.Field>
      </div>
    );
  },
});
