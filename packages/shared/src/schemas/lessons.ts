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

export const adminCreateLessonInputSchema = z.object({
  name: z.string().nullable(),
  duration: z.number().positive(),
  boardId: z.string().min(1, "Select a board"),
  maxRiders: z.number().int().positive(),
  serviceId: z.string().min(1, "Select a service"),
  trainerId: z.string().min(1, "Select a trainer"),
  levelId: z.string().nullable(),
  notes: z.string().nullable(),
  start: z.object({
    date: z.string().trim().min(1, "Select a date"),
    time: z.string().trim().min(1, "Select a time"),
  }),
  isRecurring: z.boolean(),
  riderIds: z.array(z.string()),
});

export type AdminCreateLessonInputSchema = z.infer<
  typeof adminCreateLessonInputSchema
>;

export const adminUpdateLessonInputSchema = lessonInputSchema;

export type AdminUpdateLessonInputSchema = z.infer<
  typeof adminUpdateLessonInputSchema
>;

export const riderCreateLessonSchema = z
  .object({
    trainerId: z.string().min(1, "Select a trainer"),
    boardId: z.string().min(1, "Select a board"),
    serviceId: z.string().min(1, "Select a service"),
    start: z.object({
      date: z.string().trim().min(1, "Select a date"),
      time: z.string().trim().min(1, "Select a time"),
    }),
    isServiceGroup: z.boolean(),
    acknowledgePrivateLesson: z.boolean().nullable(),
    riderId: z.string().min(1, "Select a rider"),
  })
  .superRefine((data, ctx) => {
    if (data.isServiceGroup && data.acknowledgePrivateLesson !== true) {
      ctx.addIssue({
        code: "custom",
        path: ["acknowledgePrivateLesson"],
        message: "You must acknowledge that the lesson may become private",
      });
    }
  });

export type RiderCreateLessonSchema = z.infer<typeof riderCreateLessonSchema>;

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

export const quickCreateLessonSchema = z
  .object({
    type: z.enum(["rider", "admin"]),
    trainerId: z.string().min(1, "Select a trainer"),
    boardId: z.string().min(1, "Select a board"),
    serviceId: z.string().min(1, "Select a service"),
    start: z.object({
      date: z.string().trim().min(1, "Select a date"),
      time: z.string().trim().min(1, "Select a time"),
    }),
    isServiceGroup: z.boolean(),
    acknowledgePrivateLesson: z.boolean().nullable(),
    details: z
      .object({
        name: z.string().nullable(),
        levelId: z.string().nullable(),
        notes: z.string().nullable(),
        isRecurring: z.boolean().nullable(),
      })
      .nullable(),
    riderIds: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    if (data.type === "rider" && data.riderIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["riderIds"],
        message: "You must select at least one rider",
      });
    }

    if (data.type === "rider" && data.details !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["details"],
        message: "You cannot change the details as a rider",
      });
    }

    if (
      data.isServiceGroup &&
      data.acknowledgePrivateLesson !== true &&
      data.riderIds.length === 1
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["acknowledgePrivateLesson"],
        message: "You must acknowledge that the lesson may become private",
      });
    }
  });

export type QuickCreateLessonSchema = z.infer<typeof quickCreateLessonSchema>;
