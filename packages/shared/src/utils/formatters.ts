import { DayOfWeek, MembershipRole } from "../models/enums";

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

export const ROLE_LABELS: Record<MembershipRole, string> = {
  [MembershipRole.ADMIN]: "Admin",
  [MembershipRole.TRAINER]: "Trainer",
  [MembershipRole.RIDER]: "Rider",
  [MembershipRole.GUARDIAN]: "Guardian",
} as const;
