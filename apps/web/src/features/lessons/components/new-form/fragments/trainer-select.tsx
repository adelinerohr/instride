import { type Board } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import * as React from "react";

import { riderCreateLessonFormOpts } from "@/features/lessons/lib/rider.form";
import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/shared/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { withForm } from "@/shared/hooks/use-form";

export const TrainerSelect = withForm({
  ...riderCreateLessonFormOpts,
  props: {
    boards: [] as Board[],
  },
  render: ({ form, boards }) => {
    const selectedTrainerId = useStore(
      form.store,
      (state) => state.values.trainerId
    );

    const selectedBoardId = useStore(
      form.store,
      (state) => state.values.boardId
    );
    const selectedBoard = React.useMemo(
      () => boards.find((board) => board.id === selectedBoardId),
      [boards, selectedBoardId]
    );

    const trainerOptions = React.useMemo(() => {
      if (!selectedBoard) return [];
      return selectedBoard.assignments
        .filter((a) => a.trainer !== null)
        .map((a) => a.trainer!);
    }, [selectedBoard]);

    const handleTrainerChange = (newTrainerId: string) => {
      form.setFieldValue("trainerId", newTrainerId);
      form.setFieldValue("serviceId", "");
    };

    React.useEffect(() => {
      if (
        selectedBoardId &&
        !selectedTrainerId &&
        trainerOptions.length === 1
      ) {
        handleTrainerChange(trainerOptions[0].id);
      }
    }, [
      selectedBoardId,
      selectedTrainerId,
      trainerOptions,
      handleTrainerChange,
    ]);

    return (
      <form.Field name="trainerId">
        {(field) => {
          const showTrainers = selectedBoardId && trainerOptions.length > 0;
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <FieldSet>
              <FieldLegend>
                Trainer <span className="text-destructive">*</span>
              </FieldLegend>
              {!showTrainers && (
                <FieldDescription>
                  Select a board to see available trainers.
                </FieldDescription>
              )}
              {showTrainers && (
                <RadioGroup
                  name={field.name}
                  value={field.state.value}
                  onValueChange={handleTrainerChange}
                  className="grid-cols-1 sm:grid-cols-2"
                >
                  {trainerOptions.map((trainer) => (
                    <FieldLabel
                      key={trainer.id}
                      htmlFor={trainer.id}
                      className="bg-white"
                    >
                      <Field orientation="horizontal" data-invalid={isInvalid}>
                        <FieldContent>
                          <div className="flex items-center gap-2">
                            <UserAvatar user={trainer.member.authUser} />
                            <span className="font-medium">
                              {trainer.member.authUser.name}
                            </span>
                          </div>
                        </FieldContent>
                        <RadioGroupItem
                          value={trainer.id}
                          id={trainer.id}
                          aria-invalid={isInvalid}
                        />
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
              )}
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </FieldSet>
          );
        }}
      </form.Field>
    );
  },
});
