import { DayOfWeek } from "../models/enums";

export const DAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.MON]: "Monday",
  [DayOfWeek.TUE]: "Tuesday",
  [DayOfWeek.WED]: "Wednesday",
  [DayOfWeek.THU]: "Thursday",
  [DayOfWeek.FRI]: "Friday",
  [DayOfWeek.SAT]: "Saturday",
  [DayOfWeek.SUN]: "Sunday",
} as const;

export const formatDayOfWeek = (dayOfWeek: DayOfWeek) => {
  return DAY_LABELS[dayOfWeek];
};
