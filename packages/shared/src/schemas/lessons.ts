import { z } from "zod";

import { RecurrenceFrequency } from "../models/enums";

export const lessonInputSchema = z.object({
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
  effectiveFrom: z.date().nullable(),
  riderIds: z.array(z.string()),
});

export type LessonInputSchema = z.infer<typeof lessonInputSchema>;

export const adminCreateLessonInputSchema = lessonInputSchema.omit({
  effectiveFrom: true,
});

export type AdminCreateLessonInputSchema = z.infer<
  typeof adminCreateLessonInputSchema
>;

export const adminUpdateLessonInputSchema = lessonInputSchema;

export type AdminUpdateLessonInputSchema = z.infer<
  typeof adminUpdateLessonInputSchema
>;

export const riderCreateLessonInputSchema = lessonInputSchema
  .pick({
    boardId: true,
    serviceId: true,
    start: true,
    trainerId: true,
  })
  .extend({
    riderId: z.string().min(1, "Select a rider"),
    acknowledgePrivateLesson: z.boolean(),
  });

export type RiderCreateLessonInputSchema = z.infer<
  typeof riderCreateLessonInputSchema
>;
