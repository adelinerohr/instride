import type { LessonInstance } from "@instride/api";
import * as dateFns from "date-fns";
import { parseISO } from "date-fns";

import { useCalendar } from "../hooks/use-calendar";
import { END_HOUR, START_HOUR } from "../lib/constants";
import { CalendarView } from "../lib/types";

export function rangeText() {
  const { selectedView, selectedMultiDayCount, selectedDate } = useCalendar();
  const formatString = "MMM d, yyyy";
  let start: Date;
  let end: Date;

  switch (selectedView) {
    case CalendarView.AGENDA:
      start = dateFns.startOfMonth(selectedDate);
      end = dateFns.endOfMonth(selectedDate);
      break;
    case CalendarView.WEEK:
      start = dateFns.startOfWeek(selectedDate, { weekStartsOn: 1 });
      end = dateFns.endOfWeek(selectedDate);
      break;
    case CalendarView.MULTI_DAY:
      start = dateFns.startOfDay(selectedDate);
      end = dateFns.addDays(selectedDate, selectedMultiDayCount);
      break;
    case CalendarView.DAY:
      return dateFns.format(selectedDate, formatString);
    default:
      return "Error while formatting ";
  }

  return `${dateFns.format(start, formatString)} - ${dateFns.format(end, formatString)}`;
}

export function navigateDate(direction: "previous" | "next"): Date {
  const { selectedView, selectedDate, selectedMultiDayCount } = useCalendar();

  switch (selectedView) {
    case CalendarView.AGENDA:
      return dateFns.addMonths(selectedDate, direction === "next" ? 1 : -1);
    case CalendarView.WEEK:
      return dateFns.addWeeks(selectedDate, direction === "next" ? 1 : -1);
    case CalendarView.MULTI_DAY:
      return dateFns.addDays(
        selectedDate,
        selectedMultiDayCount * (direction === "next" ? 1 : -1)
      );
    case CalendarView.DAY:
      return dateFns.addDays(selectedDate, direction === "next" ? 1 : -1);
    default:
      return selectedDate;
  }
}

export function getVisibleHours(lessons: LessonInstance[]) {
  let earliestEventHour = START_HOUR;
  let latestEventHour = END_HOUR;

  lessons.forEach((lesson) => {
    const startHour = parseISO(lesson.start).getHours();
    const endTime = parseISO(lesson.end);
    const endHour = endTime.getHours() + (endTime.getMinutes() > 0 ? 1 : 0);
    if (startHour < earliestEventHour) earliestEventHour = startHour;
    if (endHour > latestEventHour) latestEventHour = endHour;
  });

  latestEventHour = Math.min(latestEventHour, 24);

  const hours = Array.from(
    { length: latestEventHour - earliestEventHour },
    (_, i) => i + earliestEventHour
  );

  return { hours, earliestEventHour, latestEventHour };
}

export function getCalendarRange(view: CalendarView, dateString: string) {
  const date = new Date(dateString);

  const from =
    view === CalendarView.DAY
      ? dateFns.subDays(date, 1)
      : view === CalendarView.AGENDA
        ? dateFns.subMonths(date, 1)
        : dateFns.subWeeks(date, 1);

  const to =
    view === CalendarView.DAY
      ? dateFns.addDays(date, 1)
      : view === CalendarView.AGENDA
        ? dateFns.addMonths(date, 1)
        : dateFns.addWeeks(date, 1);

  return { from, to };
}
