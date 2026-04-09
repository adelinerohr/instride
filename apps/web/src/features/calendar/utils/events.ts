import type { types } from "@instride/api";

import type { LessonWithDates, TimeBlockWithDates } from "../lib/types";
import { getVisibleDayRange, overlapsDay, overlapsRange } from "./date";
import { normalizeLessons, normalizeTimeBlocks } from "./layout";

export function filterLessonsForDay(
  lessons: types.LessonInstance[],
  day: Date
): LessonWithDates[] {
  const visible = getVisibleDayRange(day);

  return normalizeLessons(lessons).filter(({ start, end }) => {
    return overlapsDay(start, end, day) && overlapsRange(start, end, visible);
  });
}

export function filterTimeBlocksForDay(
  timeBlocks: types.TimeBlock[],
  day: Date
): TimeBlockWithDates[] {
  const visible = getVisibleDayRange(day);

  return normalizeTimeBlocks(timeBlocks).filter(({ start, end }) => {
    return overlapsDay(start, end, day) && overlapsRange(start, end, visible);
  });
}
