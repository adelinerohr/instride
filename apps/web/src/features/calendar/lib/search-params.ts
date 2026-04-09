import { z } from "zod";

import { CalendarView } from "./types";

export const calendarSearchSchema = z.object({
  date: z.string().default(() => new Date().toISOString()),
  view: z
    .enum([CalendarView.DAY, CalendarView.WEEK, CalendarView.AGENDA])
    .default(CalendarView.WEEK),
  boardId: z.string().optional(),
  trainerIds: z.array(z.string()).optional(),
  lessonId: z.string().optional(),
  timeBlockId: z.string().optional(),
  createTimeBlock: z.boolean().optional(),
});

export type CalendarSearchParams = z.infer<typeof calendarSearchSchema>;
