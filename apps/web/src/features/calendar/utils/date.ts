import type { types } from "@instride/api";
import * as dateFns from "date-fns";
import { parseISO } from "date-fns";

import { END_HOUR, START_HOUR } from "../lib/constants";
import { CalendarView } from "../lib/types";

export function rangeText(view: CalendarView, date: Date) {
  const formatString = "MMM d, yyyy";
  let start: Date;
  let end: Date;

  switch (view) {
    case "agenda":
      start = dateFns.startOfMonth(date);
      end = dateFns.endOfMonth(date);
      break;
    case "week":
      start = dateFns.startOfWeek(date, { weekStartsOn: 1 });
      end = dateFns.endOfWeek(date);
      break;
    case "day":
      return dateFns.format(date, formatString);
    default:
      return "Error while formatting ";
  }

  return `${dateFns.format(start, formatString)} - ${dateFns.format(end, formatString)}`;
}

export function navigateDate(
  date: Date,
  view: CalendarView,
  direction: "previous" | "next"
): Date {
  const operations = {
    agenda: direction === "next" ? dateFns.addMonths : dateFns.subMonths,
    year: direction === "next" ? dateFns.addYears : dateFns.subYears,
    month: direction === "next" ? dateFns.addMonths : dateFns.subMonths,
    week: direction === "next" ? dateFns.addWeeks : dateFns.subWeeks,
    day: direction === "next" ? dateFns.addDays : dateFns.subDays,
  };

  return operations[view](date, 1);
}

export function getVisibleHours(lessons: types.LessonInstance[]) {
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
