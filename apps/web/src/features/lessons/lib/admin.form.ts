import {
  adminCreateLessonInputSchema,
  isoToFormParts,
  type AdminCreateLessonInputSchema,
} from "@instride/shared";
import { formOptions } from "@tanstack/react-form";

const lessonDefaultValues: AdminCreateLessonInputSchema = {
  name: "",
  boardId: "",
  start: {
    date: "",
    time: "",
  },
  trainerId: "",
  levelId: null,
  serviceId: "",
  duration: 0,
  maxRiders: 0,
  isRecurring: false,
  recurrenceFrequency: null,
  notes: "",
  riderIds: [],
};

export const adminCreateLessonFormOpts = formOptions({
  defaultValues: lessonDefaultValues,
  validators: { onSubmit: adminCreateLessonInputSchema },
});

export function buildAdminCreateLessonDefaultValues(input: {
  initialValues: {
    start: string;
    boardId: string;
    trainerId?: string;
  };
  timeZone: string;
}): AdminCreateLessonInputSchema {
  return {
    ...lessonDefaultValues,
    start: input.initialValues.start
      ? isoToFormParts(input.initialValues.start, input.timeZone)
      : { date: "", time: "" },
    boardId: input.initialValues.boardId ?? "",
    trainerId: input.initialValues.trainerId ?? "",
  };
}
