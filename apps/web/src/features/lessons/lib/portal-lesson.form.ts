import type { types } from "@instride/api";
import { lessonSeriesSchema } from "@instride/shared";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

const portalLessonInputSchema = lessonSeriesSchema
  .pick({
    boardId: true,
    serviceId: true,
    start: true,
    trainerId: true,
  })
  .extend({
    acknowledgePrivateLesson: z.boolean(),
    riderId: z.string(),
  });

type PortalLessonInputSchema = z.infer<typeof portalLessonInputSchema>;

const portalLessonDefaultValues: PortalLessonInputSchema = {
  boardId: "",
  serviceId: "",
  start: new Date().toISOString(),
  trainerId: "",
  acknowledgePrivateLesson: false,
  riderId: "",
};

export const portalLessonFormOpts = formOptions({
  defaultValues: portalLessonDefaultValues,
  validators: { onSubmit: portalLessonInputSchema },
});

interface PortalLessonInitalValues {
  start?: string;
  boardId?: string;
  trainerId?: string;
}

export function buildPortalLessonDefaultValues(input: {
  initialValues: PortalLessonInitalValues;
  boards: types.Board[];
  trainers: types.Trainer[];
  riderId?: string;
}): PortalLessonInputSchema {
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
