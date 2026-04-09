import type { types } from "@instride/api";
import * as React from "react";

import type { AgendaDay, AgendaItem } from "../lib/types";
import { getMonthDays, overlapsDay } from "../utils/date";

export type UseAgendaViewArgs = {
  date: Date;
  lessons: types.LessonInstance[];
  timeBlocks: types.TimeBlock[];
  hideEmptyDays?: boolean;
};

export function useAgendaView({
  date,
  lessons,
  timeBlocks,
  hideEmptyDays,
}: UseAgendaViewArgs): {
  days: AgendaDay[];
} {
  return React.useMemo(() => {
    const days = getMonthDays(date).map((day) => ({
      date: day,
      items: buildAgendaItemsForDay({
        day,
        lessons,
        timeBlocks,
      }),
    }));

    if (hideEmptyDays === false) {
      return { days };
    }

    return { days: days.filter((day) => day.items.length > 0) };
  }, [date, lessons, timeBlocks, hideEmptyDays]);
}

export function buildAgendaItemsForDay(args: {
  day: Date;
  lessons: types.LessonInstance[];
  timeBlocks: types.TimeBlock[];
}): AgendaItem[] {
  const { day, lessons, timeBlocks } = args;

  const lessonItems: AgendaItem[] = lessons
    .map((lesson) => {
      const start = new Date(lesson.start);
      const end = new Date(lesson.end);

      return {
        type: "lesson" as const,
        id: lesson.id,
        lesson,
        start,
        end,
      };
    })
    .filter((item) => overlapsDay(item.start, item.end, day));

  const blockItems: AgendaItem[] = timeBlocks
    .map((block) => {
      const start = new Date(block.start);
      const end = new Date(block.end);

      return {
        type: "timeBlock" as const,
        id: block.id,
        block,
        start,
        end,
      };
    })
    .filter((item) => overlapsDay(item.start, item.end, day));

  return [...lessonItems, ...blockItems].sort((a, b) => {
    const diff = a.start.getTime() - b.start.getTime();
    if (diff !== 0) return diff;
    return a.end.getTime() - b.end.getTime();
  });
}
