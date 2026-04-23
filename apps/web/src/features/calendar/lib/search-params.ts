import { z } from "zod";

import { CalendarView } from "@/features/calendar/lib/types";

export const calendarSearchSchema = z.object({
  date: z.string().default(() => new Date().toISOString()),
  view: z.enum(CalendarView).default(CalendarView.WEEK),
  multiDayCount: z.number().default(3),
  boardId: z.string().default(""),
  trainerIds: z.array(z.string()).default([]),
  lessonId: z.string().optional(),
  timeBlockId: z.string().optional(),
  createTimeBlock: z.boolean().optional(),
});

export type CalendarSearchParams = z.infer<typeof calendarSearchSchema>;

export const newLessonSearchSchema = z.object({
  start: z.string().default(() => new Date().toISOString()),
  boardId: z.string().default(""),
  trainerId: z.string().default(""),
});

export type NewLessonSearchParams = z.infer<typeof newLessonSearchSchema>;
