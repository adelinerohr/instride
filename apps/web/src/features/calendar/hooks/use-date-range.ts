import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import * as React from "react";

import { CalendarView, type DateRange } from "../lib/types";

export function useDateRange(date: Date, view: CalendarView): DateRange {
  return React.useMemo(() => {
    switch (view) {
      case CalendarView.DAY:
        return { start: startOfDay(date), end: endOfDay(date) };
      case CalendarView.WEEK:
        return { start: startOfWeek(date), end: endOfWeek(date) };
      case CalendarView.AGENDA:
        return { start: startOfMonth(date), end: endOfMonth(date) };
    }
  }, [date, view]);
}
