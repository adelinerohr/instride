import {
  isoToFormParts,
  riderCreateLessonSchema,
  type RiderCreateLessonSchema,
} from "@instride/shared";
import { formOptions } from "@tanstack/react-form";

const riderCreateLessonDefaultValues: RiderCreateLessonSchema = {
  trainerId: "",
  boardId: "",
  serviceId: "",
  start: {
    date: "",
    time: "",
  },
  isServiceGroup: false,
  acknowledgePrivateLesson: null,
  riderId: "",
};

export const riderCreateLessonFormOpts = formOptions({
  defaultValues: riderCreateLessonDefaultValues,
  validators: { onSubmit: riderCreateLessonSchema },
});

export function buildRiderCreateLessonDefaultValues(input: {
  initialValues: {
    trainerId?: string;
    boardId?: string;
    start?: string;
    riderId?: string;
  };
  timeZone: string;
}): RiderCreateLessonSchema {
  return {
    ...riderCreateLessonDefaultValues,
    start: input.initialValues.start
      ? isoToFormParts(input.initialValues.start, input.timeZone)
      : { date: "", time: "" },
    boardId: input.initialValues.boardId ?? "",
    trainerId: input.initialValues.trainerId ?? "",
    riderId: input.initialValues.riderId ?? "",
  };
}
