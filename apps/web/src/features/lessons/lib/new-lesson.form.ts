import type { types } from "@instride/api";
import {
  lessonSeriesInputSchema,
  type LessonSeriesInputSchema,
} from "@instride/shared";
import { formOptions } from "@tanstack/react-form";

const lessonDefaultValues: LessonSeriesInputSchema = {
  name: "",
  boardId: "",
  start: new Date().toISOString(),
  trainerId: "",
  levelId: "",
  serviceId: "",
  duration: 0,
  maxRiders: 0,
  isRecurring: false,
  recurrenceFrequency: null,
  effectiveFrom: null,
  notes: "",
  riderIds: [],
};

export const lessonFormOpts = formOptions({
  defaultValues: lessonDefaultValues,
  validators: { onSubmit: lessonSeriesInputSchema },
});

export function buildLessonDefaultValues(
  lesson: types.LessonSeries
): LessonSeriesInputSchema {
  return {
    ...lesson,
    effectiveFrom: lesson.effectiveFrom ? new Date(lesson.effectiveFrom) : null,
    riderIds:
      lesson.enrollments?.map((enrollment) => ({
        id: enrollment.riderId,
      })) ?? [],
  };
}
