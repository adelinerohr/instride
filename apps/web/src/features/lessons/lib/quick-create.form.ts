import {
  isoToFormParts,
  quickCreateLessonSchema,
  type QuickCreateLessonSchema,
} from "@instride/shared";
import { formOptions } from "@tanstack/react-form";

const quickCreateLessonDefaultValues: QuickCreateLessonSchema = {
  type: "rider",
  trainerId: "",
  boardId: "",
  serviceId: "",
  start: {
    date: "",
    time: "",
  },
  isServiceGroup: false,
  acknowledgePrivateLesson: null,
  details: null,
  riderIds: [],
};

export const quickCreateLessonFormOpts = formOptions({
  defaultValues: quickCreateLessonDefaultValues,
  validators: { onSubmit: quickCreateLessonSchema },
});

export function buildQuickCreateLessonDefaultValues(input: {
  initialValues: {
    trainerId?: string;
    boardId?: string;
    start?: string;
    riderId?: string;
  };
  type: "rider" | "admin";
  timeZone: string;
}): QuickCreateLessonSchema {
  return {
    ...quickCreateLessonDefaultValues,
    type: input.type,
    start: input.initialValues.start
      ? isoToFormParts(input.initialValues.start, input.timeZone)
      : { date: "", time: "" },
    boardId: input.initialValues.boardId ?? "",
    trainerId: input.initialValues.trainerId ?? "",
    riderIds: input.initialValues.riderId ? [input.initialValues.riderId] : [],
    details:
      input.type === "admin"
        ? {
            name: null,
            levelId: null,
            notes: null,
            isRecurring: null,
          }
        : null,
  };
}
