import {
  addDays,
  format,
  isSameDay,
  startOfDay,
  startOfWeek,
  max as dfMax,
  min as dfMin,
  endOfMonth,
  startOfMonth,
  eachDayOfInterval,
  isValid,
  parseISO,
  endOfWeek,
} from "date-fns";

import { END_HOUR, SLOT_HEIGHT, START_HOUR } from "../lib/constants";
import { CalendarView, type TimeRange } from "../lib/types";

export const VIEW_LABELS: Record<CalendarView, string> = {
  [CalendarView.WEEK]: "Week",
  [CalendarView.DAY]: "Day",
  [CalendarView.AGENDA]: "Month",
};

const FORMAT_STRING = "MMM d, yyyy";

export function rangeText(view: CalendarView, date: Date): string {
  let start: Date;
  let end: Date;

  switch (view) {
    case CalendarView.DAY:
      return format(date, FORMAT_STRING);
    case CalendarView.WEEK:
      start = startOfWeek(date);
      end = endOfWeek(date);
      break;
    case CalendarView.AGENDA:
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    default:
      return "Error generating range text";
  }

  return `${format(start, FORMAT_STRING)} - ${format(end, FORMAT_STRING)}`;
}

export function formatTime(date: Date | string): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsedDate)) return "";
  return format(parsedDate, "h:mm a");
}

export function formatDateLabel(date: Date, view: CalendarView) {
  return {
    [CalendarView.WEEK]: format(date, "MMMM yyyy"),
    [CalendarView.DAY]: format(date, "EEEE, MMMM d, yyyy"),
    [CalendarView.AGENDA]: format(date, "MMMM yyyy"),
  }[view];
}

export function toDate(date: string | Date): Date {
  return date instanceof Date ? date : new Date(date);
}

export function getMonthDays(date: Date): Date[] {
  return eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  });
}

export function getWeekDays(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getVisibleDayRange(date: Date): TimeRange {
  const start = new Date(date);
  start.setHours(START_HOUR, 0, 0, 0);

  const end = new Date(date);
  end.setHours(END_HOUR, 0, 0, 0);

  return { start, end };
}

export function overlapsRange(
  start: Date,
  end: Date,
  range: TimeRange
): boolean {
  return start < range.end && end > range.start;
}

export function overlapsDay(start: Date, end: Date, day: Date): boolean {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);

  return start < dayEnd && end > dayStart;
}

export function clampToVisibleRange(
  start: Date,
  end: Date,
  day: Date
): TimeRange {
  const visible = getVisibleDayRange(day);
  return {
    start: dfMax([start, visible.start]),
    end: dfMin([end, visible.end]),
  };
}

export function isTodayWithinVisibleHours(
  day: Date,
  now: Date = new Date()
): boolean {
  if (!isSameDay(day, now)) return false;
  const hour = now.getHours() + now.getMinutes() / 60;
  return hour >= START_HOUR && hour < END_HOUR;
}

export function getCurrentTimeTop(now: Date = new Date()) {
  const hourOffset =
    now.getHours() -
    START_HOUR +
    now.getMinutes() / 60 +
    now.getSeconds() / 3600;

  return hourOffset * SLOT_HEIGHT;
}
