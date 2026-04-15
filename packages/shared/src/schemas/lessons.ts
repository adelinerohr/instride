import { z } from "zod";

import {
  DayOfWeek,
  LessonInstanceEnrollmentStatus,
  LessonInstanceStatus,
  LessonSeriesEnrollmentStatus,
  LessonSeriesStatus,
  RecurrenceFrequency,
} from "../models/enums";

// --- Base Schemas ------------------------------------------------------------

export const lessonInstanceEnrollmentSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  instanceId: z.string(),
  status: z.enum(LessonInstanceEnrollmentStatus),
  attended: z.boolean().nullable(),
  riderMemberId: z.string(),
  enrolledByMemberId: z.string().nullable(),
  enrolledAt: z.coerce.date(),
  waitlistPosition: z.number().nullable(),
  attendedAt: z.coerce.date().nullable(),
  markedByMemberId: z.string().nullable(),
  fromSeriesEnrollmentId: z.string().nullable(),
  unenrolledAt: z.coerce.date().nullable(),
  unenrolledByMemberId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const lessonSeriesEnrollmentSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  status: z.enum(LessonSeriesEnrollmentStatus),
  seriesId: z.string(),
  riderMemberId: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  enrolledByMemberId: z.string().nullable(),
  enrolledAt: z.coerce.date(),
  endedAt: z.coerce.date().nullable(),
  endedByMemberId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const lessonInstanceSchema = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  id: z.string(),
  organizationId: z.string(),
  status: z.enum(LessonInstanceStatus),
  name: z.string().nullable(),
  seriesId: z.string(),
  boardId: z.string(),
  maxRiders: z.number(),
  serviceId: z.string(),
  trainerId: z.string(),
  levelId: z.string().nullable(),
  notes: z.string().nullable(),
});

export const lessonSeriesSchema = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  id: z.string(),
  organizationId: z.string(),
  status: z.enum(LessonSeriesStatus),
  name: z.string().nullable(),
  duration: z.number().positive(),
  boardId: z.string().min(1, "Select a board"),
  maxRiders: z.number().int().positive(),
  serviceId: z.string().min(1, "Select a service"),
  trainerId: z.string().min(1, "Select a trainer"),
  levelId: z.string().nullable(),
  notes: z.string().nullable(),
  start: z.string(),
  isRecurring: z.boolean(),
  recurrenceFrequency: z.enum(RecurrenceFrequency).nullable(),
  recurrenceByDay: z.array(z.enum(DayOfWeek)).nullable(),
  recurrenceEnd: z.date().nullable(),
  effectiveFrom: z.date().nullable(),
  lastPlannedUntil: z.date().nullable(),
  createdByMemberId: z.string().nullable(),
  updatedByMemberId: z.string().nullable(),
});

// ---- Contracts -------------------------------------------------------------

export const lessonSeriesInputSchema = lessonSeriesSchema
  .pick({
    name: true,
    duration: true,
    boardId: true,
    maxRiders: true,
    serviceId: true,
    trainerId: true,
    levelId: true,
    notes: true,
    start: true,
    isRecurring: true,
    recurrenceFrequency: true,
    effectiveFrom: true,
  })
  .extend({
    riderIds: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurrenceFrequency) {
      ctx.addIssue({
        code: "custom",
        path: ["recurrenceFrequency"],
        message: "Frequency is required for recurring series",
      });
    }
  });

export type LessonSeriesInputSchema = z.infer<typeof lessonSeriesInputSchema>;

export const updateLessonSeriesSchema = lessonSeriesSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
