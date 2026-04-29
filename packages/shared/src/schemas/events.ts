import { z } from "zod";

import { EventScope } from "../models/enums";

export const eventInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  start: z.object({
    date: z.string(),
    time: z.string().nullable(),
  }),
  end: z.object({
    date: z.string(),
    time: z.string().nullable(),
  }),
  scope: z.enum(EventScope),
  boardIds: z.array(z.string()),
  trainerIds: z.array(z.string()),
  blockScheduling: z.boolean(),
});

export type EventInput = z.infer<typeof eventInputSchema>;
