import { CalendarView } from "../lib/types";

type MultiDayLayout =
  | { kind: "week"; days: Date[] }
  | { kind: "day"; day: Date; trainersPerDay: number }
  | { kind: "multi-day"; days: Date[]; trainersPerDay: number[] };

export function getMultiDayLayout(params: {
  selectedView: CalendarView;
  visibleDays: Date[];
  trainersPerDay: number | number[];
}): MultiDayLayout {
  if (params.selectedView === CalendarView.WEEK) {
    return { kind: "week", days: params.visibleDays };
  }

  if (
    params.selectedView === CalendarView.MULTI_DAY &&
    Array.isArray(params.trainersPerDay) &&
    params.trainersPerDay.some((count) => count > 0)
  ) {
    return {
      kind: "multi-day",
      days: params.visibleDays,
      trainersPerDay: params.trainersPerDay,
    };
  }

  return {
    kind: "day",
    day: params.visibleDays[0],
    trainersPerDay: Array.isArray(params.trainersPerDay)
      ? (params.trainersPerDay[0] ?? 0)
      : params.trainersPerDay,
  };
}

export function layoutTotalColumns(layout: MultiDayLayout): number {
  switch (layout.kind) {
    case "week":
      return layout.days.length;
    case "multi-day":
      return layout.trainersPerDay.reduce((sum, n) => sum + n, 0);
    case "day":
      return layout.trainersPerDay;
  }
}

export function layoutDays(layout: MultiDayLayout): Date[] {
  return layout.kind === "day" ? [layout.day] : layout.days;
}

export function dayColumnRange(
  layout: MultiDayLayout,
  dayIndex: number
): { start: number; span: number } {
  switch (layout.kind) {
    case "week":
      return { start: dayIndex + 1, span: 1 };
    case "day":
      return { start: 1, span: layout.trainersPerDay };
    case "multi-day":
      let start = 1;
      for (let i = 0; i < dayIndex; i++) {
        start += layout.trainersPerDay[i];
      }
      return { start, span: layout.trainersPerDay[dayIndex] };
  }
}
