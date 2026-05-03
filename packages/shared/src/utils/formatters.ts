import { TIME_OPTIONS } from "../constants";
import {
  DayOfWeek,
  MembershipRole,
  RecurrenceFrequency,
} from "../models/enums";
import { normalizeTimeSlot } from "./time";

export const ROLE_LABELS = {
  [MembershipRole.ADMIN]: "Admin",
  [MembershipRole.TRAINER]: "Trainer",
  [MembershipRole.RIDER]: "Rider",
  [MembershipRole.GUARDIAN]: "Guardian",
};

export const ROLE_VARIANTS: Record<
  MembershipRole,
  | "link"
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | null
  | undefined
> = {
  [MembershipRole.ADMIN]: "default",
  [MembershipRole.TRAINER]: "secondary",
  [MembershipRole.RIDER]: "outline",
  [MembershipRole.GUARDIAN]: "default",
};

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

export function replaceYouWithThey(text: string): string {
  return text
    .replace(/\bYou\b/g, "They")
    .replace(/\byou\b/g, "they")
    .replace(/\bYour\b/g, "Their")
    .replace(/\byour\b/g, "their")
    .replace(/\bYours\b/g, "Theirs")
    .replace(/\byours\b/g, "theirs")
    .replace(/\bYourself\b/g, "Themselves")
    .replace(/\byourself\b/g, "themselves");
}

export function formatTimeLabel(raw: string | null | undefined): string {
  if (raw == null || raw === "") {
    return "—";
  }
  const slot = normalizeTimeSlot(raw, "00:00");
  const opt = TIME_OPTIONS.find((t) => t.value === slot);
  return opt?.label ?? slot;
}

export function formatOrgName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function pluralize(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}

export function formatUSPhone(input: string): string {
  const match = input.match(/^\+?1?(\d{3})(\d{3})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : input;
}
