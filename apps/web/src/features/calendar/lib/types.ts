export enum CalendarView {
  DAY = "day",
  MULTI_DAY = "multi-day",
  WEEK = "week",
  AGENDA = "agenda",
}

export interface VisibleHours {
  from: number;
  to: number;
}
