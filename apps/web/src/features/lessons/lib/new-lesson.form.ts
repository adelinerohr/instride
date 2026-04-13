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

export function buildLessonDefaultValues(initialValues: {
  lesson?: types.LessonInstance;
  start?: string;
  boardId?: string;
  trainerId?: string;
}): LessonSeriesInputSchema {
  if (initialValues.lesson) {
    const lesson = initialValues.lesson;
    const series = lesson.series;

    // Map only series-form fields. Do not spread the full instance — it includes
    // instance-only `status` ("scheduled" | …) which breaks updateLessonSeries
    // (expects LessonSeriesStatus: "active" | "paused" | …).
    return {
      ...lessonDefaultValues,
      name: lesson.name ?? "",
      boardId: lesson.boardId,
      trainerId: lesson.trainerId,
      serviceId: lesson.serviceId,
      levelId: lesson.levelId ?? "",
      notes: lesson.notes ?? "",
      maxRiders: lesson.maxRiders,
      start:
        typeof lesson.start === "string"
          ? lesson.start
          : new Date(lesson.start).toISOString(),
      duration: Math.floor(
        (new Date(lesson.end).getTime() - new Date(lesson.start).getTime()) /
          60000
      ),
      isRecurring: series?.isRecurring ?? false,
      recurrenceFrequency: series?.recurrenceFrequency ?? null,
      effectiveFrom: series?.effectiveFrom
        ? new Date(series.effectiveFrom)
        : null,
      riderIds:
        lesson.enrollments?.map((enrollment) => enrollment.riderId) ?? [],
    };
  } else {
    return {
      ...lessonDefaultValues,
      start: initialValues.start ?? "",
      boardId: initialValues.boardId ?? "",
      trainerId: initialValues.trainerId ?? "",
    };
  }
}
