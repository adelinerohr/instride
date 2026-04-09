import {
  DayOfWeek,
  MembershipRole,
  RecurrenceFrequency,
} from "@instride/shared";
import * as React from "react";

import type { Badge } from "@/shared/components/ui/badge";

export function getInitials(name?: string | undefined): string {
  if (!name) {
    return "";
  }
  return name
    .replace(/\s+/, " ")
    .split(" ")
    .slice(0, 2)
    .map((v) => v && v[0].toUpperCase())
    .join("");
}

export function getFirstName(name?: string | undefined): string {
  if (!name) {
    return "";
  }
  return name.split(" ")[0];
}

export function getLastName(name?: string | undefined): string {
  if (!name) {
    return "";
  }
  return name.split(" ").slice(1).join(" ");
}

export const ROLE_LABELS = {
  [MembershipRole.ADMIN]: "Admin",
  [MembershipRole.TRAINER]: "Trainer",
  [MembershipRole.RIDER]: "Rider",
  [MembershipRole.GUARDIAN]: "Guardian",
};

export const ROLE_VARIANTS: Record<
  MembershipRole,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  [MembershipRole.ADMIN]: "default",
  [MembershipRole.TRAINER]: "secondary",
  [MembershipRole.RIDER]: "outline",
  [MembershipRole.GUARDIAN]: "ghost",
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

export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {}
) {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: opts.month ?? "long",
      day: opts.day ?? "numeric",
      year: opts.year ?? "numeric",
      ...opts,
    }).format(new Date(date));
  } catch {
    return "";
  }
}
