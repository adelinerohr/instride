import { z } from "zod";

import { EventScope } from "../models/enums";

export const eventInputSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().nullable(),
    start: z.object({
      date: z.string(),
      time: z.string().nullable(),
      allDay: z.boolean(),
    }),
    end: z.object({
      date: z.string(),
      time: z.string().nullable(),
      allDay: z.boolean(),
    }),
    scope: z.enum(EventScope),
    boardIds: z.array(z.string()),
    trainerIds: z.array(z.string()),
    blockScheduling: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.scope === EventScope.BOARD && data.boardIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Board is required",
        path: ["boardIds"],
      });
    }

    if (data.scope === EventScope.TRAINER && data.trainerIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Trainer is required",
        path: ["trainerIds"],
      });
    }
  });

export type EventInput = z.infer<typeof eventInputSchema>;
