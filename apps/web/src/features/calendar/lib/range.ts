import {
  endOfWeek,
  endOfDay,
  startOfWeek,
  startOfDay,
  addDays,
  startOfMonth,
  endOfMonth,
  addWeeks,
  subDays,
  subMonths,
  addMonths,
  subWeeks,
} from "date-fns";

import { CalendarView } from "./types";

export function getVisibleRange(
  view: CalendarView,
  date: Date
): { from: Date; to: Date } {
  switch (view) {
    case CalendarView.DAY:
      return { from: startOfDay(date), to: endOfDay(date) };
    case CalendarView.WEEK:
      return {
        from: startOfWeek(date, { weekStartsOn: 1 }),
        to: endOfWeek(date, { weekStartsOn: 1 }),
      };
    case CalendarView.MULTI_DAY:
      // Adjust to whatever your multi-day view actually shows
      return { from: startOfDay(date), to: endOfDay(addDays(date, 2)) };
    case CalendarView.AGENDA:
      return { from: startOfMonth(date), to: endOfMonth(date) };
  }
}

export function getAdjacentRanges(view: CalendarView, date: Date) {
  const step = (d: Date, dir: 1 | -1): Date => {
    switch (view) {
      case CalendarView.DAY:
        return dir === 1 ? addDays(d, 1) : subDays(d, 1);
      case CalendarView.WEEK:
        return dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1);
      case CalendarView.MULTI_DAY:
        return dir === 1 ? addDays(d, 3) : subDays(d, 3);
      case CalendarView.AGENDA:
        return dir === 1 ? addMonths(d, 1) : subMonths(d, 1);
    }
  };
  return {
    prev: getVisibleRange(view, step(date, -1)),
    next: getVisibleRange(view, step(date, 1)),
  };
}
