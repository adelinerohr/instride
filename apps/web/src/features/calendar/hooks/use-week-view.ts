import type { types } from "@instride/api";
import * as React from "react";

import type { WeekDayColumn } from "../lib/types";
import { getWeekDays } from "../utils/date";
import {
  buildDayLessonsLayout,
  buildDayTimeBlocksLayout,
} from "../utils/layout";

export type UseWeekViewArgs = {
  date: Date;
  lessons: types.LessonInstance[];
  timeBlocks: types.TimeBlock[];
};

export function useWeekView({ date, lessons, timeBlocks }: UseWeekViewArgs): {
  days: WeekDayColumn[];
} {
  return React.useMemo(() => {
    const days = getWeekDays(date).map((day) => ({
      date: day,
      lessons: buildDayLessonsLayout({ day, lessons }),
      timeBlocks: buildDayTimeBlocksLayout({ day, timeBlocks }),
    }));

    return { days };
  }, [date, lessons, timeBlocks]);
}
