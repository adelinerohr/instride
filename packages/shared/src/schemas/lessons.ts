import { z } from "zod";

import {
  DayOfWeek,
  LessonInstanceEnrollmentStatus,
  LessonInstanceStatus,
  LessonSeriesEnrollmentStatus,
  LessonSeriesStatus,
  RecurrenceFrequency,
} from "../models/enums";
import { dateLikeSchema } from "../utils/schema";

// --- Base Schemas ------------------------------------------------------------

export const lessonInstanceEnrollmentSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  instanceId: z.string(),
  status: z.enum(LessonInstanceEnrollmentStatus),
  attended: z.boolean().nullable(),
  riderMemberId: z.string(),
  enrolledByMemberId: z.string().nullable(),
  enrolledAt: dateLikeSchema,
  waitlistPosition: z.number().nullable(),
  attendedAt: dateLikeSchema.nullable(),
  markedByMemberId: z.string().nullable(),
  fromSeriesEnrollmentId: z.string().nullable(),
  unenrolledAt: dateLikeSchema.nullable(),
  unenrolledByMemberId: z.string().nullable(),
  createdAt: dateLikeSchema,
  updatedAt: dateLikeSchema,
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
  enrolledAt: dateLikeSchema,
  endedAt: dateLikeSchema.nullable(),
  endedByMemberId: z.string().nullable(),
  createdAt: dateLikeSchema,
  updatedAt: dateLikeSchema,
});

export const lessonInstanceSchema = z.object({
  createdAt: dateLikeSchema,
  updatedAt: dateLikeSchema,
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
  createdAt: dateLikeSchema,
  updatedAt: dateLikeSchema,
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
