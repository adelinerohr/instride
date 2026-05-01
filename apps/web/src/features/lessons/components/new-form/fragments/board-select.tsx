import { type Board } from "@instride/api";
import { useStore } from "@tanstack/react-form";
import * as React from "react";

import { riderCreateLessonFormOpts } from "@/features/lessons/lib/rider.form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/shared/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { withForm } from "@/shared/hooks/use-form";

export const BoardSelect = withForm({
  ...riderCreateLessonFormOpts,
  props: {
    boards: [] as Board[],
    isPending: false,
  },
  render: ({ form, boards, isPending }) => {
    const selectedRiderId = useStore(form.store, (s) => s.values.riderId);
    const selectedBoardId = useStore(form.store, (s) => s.values.boardId);

    const handleBoardChange = (newBoardId: string) => {
      form.setFieldValue("boardId", newBoardId);
      form.setFieldValue("trainerId", "");
      form.setFieldValue("serviceId", "");
    };

    // Auto-select when there's only one board available for this rider.
    React.useEffect(() => {
      if (selectedRiderId && !selectedBoardId && boards.length === 1) {
        handleBoardChange(boards[0].id);
      }
    }, [selectedRiderId, selectedBoardId, boards, handleBoardChange]);

    return (
      <form.Field name="boardId">
        {(field) => {
          const showBoards = selectedRiderId && boards.length > 0 && !isPending;
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <FieldSet>
              <FieldLegend>
                Board <span className="text-destructive">*</span>
              </FieldLegend>
              {!showBoards && (
                <FieldDescription>
                  Select a rider to see available boards.
                </FieldDescription>
              )}
              {showBoards && (
                <RadioGroup
                  name={field.name}
                  value={field.state.value}
                  onValueChange={handleBoardChange}
                >
                  {boards.map((board) => (
                    <FieldLabel
                      key={board.id}
                      htmlFor={board.id}
                      className="bg-white"
                    >
                      <Field orientation="horizontal" data-invalid={isInvalid}>
                        <FieldContent>
                          <FieldTitle>{board.name}</FieldTitle>
                        </FieldContent>
                        <RadioGroupItem
                          value={board.id}
                          id={board.id}
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
