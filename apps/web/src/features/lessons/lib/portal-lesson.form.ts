import type { Board, Trainer } from "@instride/api";
import {
  riderCreateLessonInputSchema,
  type RiderCreateLessonInputSchema,
} from "@instride/shared";
import { formOptions } from "@tanstack/react-form";

const portalLessonDefaultValues: RiderCreateLessonInputSchema = {
  boardId: "",
  serviceId: "",
  start: new Date().toISOString(),
  trainerId: "",
  acknowledgePrivateLesson: false,
  riderId: "",
};

export const portalLessonFormOpts = formOptions({
  defaultValues: portalLessonDefaultValues,
  validators: { onSubmit: riderCreateLessonInputSchema },
});

interface PortalLessonInitalValues {
  start?: string;
  boardId?: string;
  trainerId?: string;
}

export function buildPortalLessonDefaultValues(input: {
  initialValues: PortalLessonInitalValues;
  boards: Board[];
  trainers: Trainer[];
  riderId?: string;
}): RiderCreateLessonInputSchema {
  // Validate that the trainer is assigned to the board
  const selectedTrainer = input.trainers.find(
    (trainer) => trainer.id === input.initialValues.trainerId
  );
  const selectedBoard = input.boards.find(
    (board) => board.id === input.initialValues.boardId
  );

  const isTrainerAssignedToBoard = selectedBoard?.assignments?.some(
    (a) => a.trainerId === selectedTrainer?.id
  );

  return {
    ...portalLessonDefaultValues,
    start: input.initialValues.start ?? "",
    boardId: selectedBoard ? selectedBoard.id : "",
    trainerId:
      selectedTrainer && isTrainerAssignedToBoard ? selectedTrainer.id : "",
    riderId: input.riderId ?? "",
  };
}
