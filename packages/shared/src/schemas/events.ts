import { z } from "zod";

import { EventScope } from "../models/enums";

export const eventInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  scope: z.enum(EventScope),
  boardIds: z.array(z.string()),
  trainerIds: z.array(z.string()),
  blockScheduling: z.boolean(),
});

export type EventInput = z.infer<typeof eventInputSchema>;
