import { DayOfWeek, RecurrenceFrequency } from "@instride/shared";

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: DayOfWeek.MON, label: "Monday" },
  { value: DayOfWeek.TUE, label: "Tuesday" },
  { value: DayOfWeek.WED, label: "Wednesday" },
  { value: DayOfWeek.THU, label: "Thursday" },
  { value: DayOfWeek.FRI, label: "Friday" },
  { value: DayOfWeek.SAT, label: "Saturday" },
  { value: DayOfWeek.SUN, label: "Sunday" },
];

export const RECURRENCE_OPTIONS: {
  value: RecurrenceFrequency;
  label: string;
}[] = [
  { value: RecurrenceFrequency.WEEKLY, label: "Weekly" },
  { value: RecurrenceFrequency.BIWEEKLY, label: "Every 2 weeks" },
];

export const DAY_LABEL_MAP: Record<DayOfWeek, string> = {
  [DayOfWeek.MON]: "Monday",
  [DayOfWeek.TUE]: "Tuesday",
  [DayOfWeek.WED]: "Wednesday",
  [DayOfWeek.THU]: "Thursday",
  [DayOfWeek.FRI]: "Friday",
  [DayOfWeek.SAT]: "Saturday",
  [DayOfWeek.SUN]: "Sunday",
} as const;
