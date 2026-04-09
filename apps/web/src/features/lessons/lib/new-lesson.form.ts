import type { types } from "@instride/api";
import { lessonSeriesInputSchema } from "@instride/shared";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export const lessonSchema = lessonSeriesInputSchema.extend({
  riderIds: z.array(z.object({ id: z.string() })),
});

export type LessonFormValues = z.infer<typeof lessonSchema>;

const lessonDefaultValues: LessonFormValues = {
  name: "",
  boardId: "",
  start: new Date(),
  trainerId: "",
  levelId: "",
  serviceId: "",
  duration: 0,
  maxRiders: 0,
  isRecurring: false,
  recurrenceFrequency: null,
  recurrenceByDay: null,
  recurrenceEnd: null,
  effectiveFrom: null,
  lastPlannedUntil: null,
  notes: "",
  riderIds: [],
};

export const lessonFormOpts = formOptions({
  defaultValues: lessonDefaultValues,
  validators: { onSubmit: lessonSchema },
});

export function buildLessonDefaultValues(
  lesson: types.LessonSeries
): LessonFormValues {
  return {
    ...lesson,
    start: new Date(lesson.start),
    recurrenceEnd: lesson.recurrenceEnd ? new Date(lesson.recurrenceEnd) : null,
    effectiveFrom: lesson.effectiveFrom ? new Date(lesson.effectiveFrom) : null,
    lastPlannedUntil: lesson.lastPlannedUntil
      ? new Date(lesson.lastPlannedUntil)
      : null,
    riderIds:
      lesson.enrollments?.map((enrollment) => ({
        id: enrollment.riderId,
      })) ?? [],
  };
}
