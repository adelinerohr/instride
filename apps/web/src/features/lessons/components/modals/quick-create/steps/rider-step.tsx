import type { Rider, Trainer } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import { UsersIcon } from "lucide-react";

import { quickCreateLessonFormOpts } from "@/features/lessons/lib/quick-create.form";
import { LevelBadge } from "@/features/organization/components/fragments/badges";
import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSet,
} from "@/shared/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Tooltip, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { withForm } from "@/shared/hooks/use-form";
import { cn } from "@/shared/lib/utils";

interface Props {
  resolvedRiders: Rider[];
  eligibleRiders: Rider[];
  selectedTrainer?: Trainer;
  boardName: string;
}

export const RiderStep = withForm({
  ...quickCreateLessonFormOpts,
  props: {} as Props,
  render: ({
    form,
    resolvedRiders,
    eligibleRiders,
    boardName,
    selectedTrainer,
  }) => {
    const type = useStore(form.store, (state) => state.values.type);

    const riderOptions = selectedTrainer
      ? resolvedRiders.filter(
          (rider) => rider.memberId !== selectedTrainer.memberId
        )
      : resolvedRiders;

    if (type === "admin") return null;

    return (
      <div className="space-y-3">
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <UsersIcon className="h-4 w-4" />
          Showing riders assigned to
          <span className="font-medium text-foreground">{boardName}</span>.
        </p>

        <form.Field name="riderIds">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <FieldSet>
                <RadioGroup
                  name={field.name}
                  value={field.state.value[0]}
                  onValueChange={(value) => field.handleChange([value])}
                >
                  {riderOptions.map((rider) => {
                    const isEligible = eligibleRiders.some(
                      (r) => r.id === rider.id
                    );

                    return (
                      <Tooltip key={rider.id} disabled={isEligible}>
                        <TooltipTrigger
                          render={<FieldLabel htmlFor={rider.id} />}
                        >
                          <Field
                            orientation="horizontal"
                            data-invalid={isInvalid}
                            className={cn(
                              "items-center!",
                              !isEligible && "opacity-50"
                            )}
                          >
                            <FieldContent className="flex-row gap-2">
                              <UserAvatar
                                user={rider.member.authUser}
                                size="lg"
                              />
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium leading-tight">
                                  {rider.member.authUser.name}
                                </span>
                                <LevelBadge level={rider.level} />
                              </div>
                            </FieldContent>
                            <RadioGroupItem
                              value={rider.id}
                              id={rider.id}
                              aria-invalid={isInvalid}
                              disabled={!isEligible}
                            />
                          </Field>
                        </TooltipTrigger>
                      </Tooltip>
                    );
                  })}
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
