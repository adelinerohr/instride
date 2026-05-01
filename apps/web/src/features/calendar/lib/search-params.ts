import { z } from "zod";

import { CalendarView } from "@/features/calendar/lib/types";

export const calendarSearchSchema = z.object({
  date: z.coerce.date().default(() => new Date()),
  view: z.enum(CalendarView).default(CalendarView.MULTI_DAY),
  multiDayCount: z.number().default(3),
  boardId: z.string().default(""),
  trainerIds: z.array(z.string()).default([]),
});

export type CalendarSearchParams = z.infer<typeof calendarSearchSchema>;

export const newLessonSearchSchema = z.object({
  start: z.string().default(() => new Date().toISOString()),
  boardId: z.string().default(""),
  trainerId: z.string().default(""),
});

export type NewLessonSearchParams = z.infer<typeof newLessonSearchSchema>;
