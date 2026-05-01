import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import { DayOfWeek } from "../models/enums";

export interface LocalParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
}

export interface TimeSlot {
  openTime: string; // "HH:MM" or "HH:MM:SS"
  closeTime: string;
}

export interface DayHours {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  slots: TimeSlot[];
}

export interface EffectiveBusinessHoursDay extends DayHours {
  boardId: string | null;
}

export type EffectiveBusinessHours = Record<
  DayOfWeek,
  EffectiveBusinessHoursDay
>;
export type TrainerEffectiveBusinessHours = Record<
  string,
  EffectiveBusinessHours
>;

interface BusinessHoursBundle<TRow extends DayHours> {
  defaults: TRow[];
  boardOverrides: Record<string, TRow[]>;
}

/**
 * Parse "HH:MM" into total minutes from midnight
 * @param time - The time to convert to minutes in the format "HH:MM"
 * @returns The time in minutes
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

/**
 * Project an org or trainer list-business-hours response into a per-day
 * lookup for the given board. Falls back to defaults when the board has no
 * override. Missing days default to closed.
 */
export function resolveEffectiveBusinessHours<TRow extends DayHours>(
  businessHours: BusinessHoursBundle<TRow>,
  boardId?: string
): EffectiveBusinessHours {
  const rows =
    (boardId && businessHours.boardOverrides[boardId]) ||
    businessHours.defaults;

  const byDay = new Map(rows.map((day) => [day.dayOfWeek, day]));

  return Object.fromEntries(
    Object.values(DayOfWeek).map((dow) => {
      const row = byDay.get(dow);
      const slots = row?.isOpen
        ? [...row.slots]
            .sort((a, b) =>
              a.openTime < b.openTime ? -1 : a.openTime > b.openTime ? 1 : 0
            )
            .map((slot) => ({
              openTime: slot.openTime.slice(0, 5),
              closeTime: slot.closeTime.slice(0, 5),
            }))
        : [];

      return [
        dow,
        {
          dayOfWeek: dow,
          isOpen: row?.isOpen ?? false,
          boardId: boardId ?? null,
          slots,
        } satisfies EffectiveBusinessHoursDay,
      ];
    })
  ) as EffectiveBusinessHours;
}

/**
 * Does the given hour (0-23) fall inside any slot on the given day?
 * Used by the calendar to shade non-working hours.
 */
export function isWorkingHour(input: {
  day: Date;
  hour: number;
  businessHours: EffectiveBusinessHours | undefined;
}): boolean {
  if (!input.businessHours) return false;

  const dayKey = getDayOfWeek(input.day);
  const dayHours = input.businessHours[dayKey];

  if (!dayHours?.isOpen || dayHours.slots.length === 0) return false;

  const slotStart = input.hour * 60;

  return dayHours.slots.some((slot) => {
    const open = timeToMinutes(slot.openTime);
    const close = timeToMinutes(slot.closeTime);
    return slotStart >= open && slotStart < close;
  });
}

/**
 * Check if a trainer is working on a given day
 */
export function isTrainerWorkingOnDay(params: {
  day: Date;
  businessHours: EffectiveBusinessHours;
}): boolean {
  const dayHours = params.businessHours[getDayOfWeek(params.day)];
  return dayHours?.isOpen ?? false;
}

/**
 * Check if a time range falls within business hours
 * @param startTime - The start time to check in the format "HH:MM"
 * @param endTime - The end time to check in the format "HH:MM"
 * @param slots - The slots to check
 * @returns Whether the time range falls within business hours
 */
export function isWithinAnySlot(input: {
  startTime: string;
  endTime: string;
  slots: TimeSlot[];
}): boolean {
  const start = timeToMinutes(input.startTime);
  const end = timeToMinutes(input.endTime);

  return input.slots.some((slot) => {
    const slotStart = timeToMinutes(slot.openTime);
    const slotEnd = timeToMinutes(slot.closeTime);
    return start >= slotStart && end <= slotEnd;
  });
}

/**
 * Build an empty week of day hours
 * @returns An array of empty day hours
 */
export function buildEmptyWeek(): DayHours[] {
  return Object.values(DayOfWeek).map((day) => ({
    dayOfWeek: day,
    isOpen: false,
    slots: [],
  }));
}

export const JS_WEEKDAY_TO_DAY_OF_WEEK: DayOfWeek[] = [
  DayOfWeek.SUN,
  DayOfWeek.MON,
  DayOfWeek.TUE,
  DayOfWeek.WED,
  DayOfWeek.THU,
  DayOfWeek.FRI,
  DayOfWeek.SAT,
];

/**
 * Convert a date to a day of week
 * @param date - The date to convert to a day of week
 * @returns The day of week
 */
export function getDayOfWeek(date: Date): DayOfWeek {
  const jsDay = date.getDay();
  return JS_WEEKDAY_TO_DAY_OF_WEEK[jsDay];
}

/**
 * Get the day of week for a date in a given time zone
 * @param input - The date and time zone to get the day of week for
 * @returns The day of week
 */
export function getDOWInTimeZone(input: {
  date: Date;
  timeZone: string;
}): number {
  return Number(formatInTimeZone(input.date, input.timeZone, "i")) % 7;
}

/**
 * Convert minutes to hours and minutes
 * @param minutes - The minutes to convert to hours and minutes
 * @returns The hours and minutes
 */
export function minutesToHourMinute(minutes: number): {
  hour: number;
  minute: number;
} {
  return {
    hour: Math.floor(minutes / 60),
    minute: minutes % 60,
  };
}

export function isoToFormParts(iso: string, tz: string) {
  return {
    date: formatInTimeZone(iso, tz, "yyyy-MM-dd"),
    time: formatInTimeZone(iso, tz, "HH:mm"),
  };
}

export function formPartsToIso(
  parts: { date: string; time: string },
  tz: string
) {
  return fromZonedTime(`${parts.date}T${parts.time}:00`, tz).toISOString();
}
