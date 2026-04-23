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

/**
 * Convert a date to a day of week
 * @param date - The date to convert to a day of week
 * @returns The day of week
 */
export function getDayOfWeek(date: Date): DayOfWeek {
  const jsDay = date.getDay();

  switch (jsDay) {
    case 0:
      return DayOfWeek.SUN;
    case 1:
      return DayOfWeek.MON;
    case 2:
      return DayOfWeek.TUE;
    case 3:
      return DayOfWeek.WED;
    case 4:
      return DayOfWeek.THU;
    case 5:
      return DayOfWeek.FRI;
    case 6:
      return DayOfWeek.SAT;
    default:
      throw Error("Invalid date");
  }
}

/**
 * Add days to a year, month, and day
 * @param input - The year, month, and day to add days to
 * @returns The year, month, and day after adding the days
 */
export function addDaysToYmd(input: {
  year: number;
  month: number;
  day: number;
  daysToAdd: number;
}): { year: number; month: number; day: number } {
  const utc = new Date(
    Date.UTC(input.year, input.month - 1, input.day + input.daysToAdd)
  );

  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
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
  const dayName = formatInTimeZone(input.date, input.timeZone, "EEE");
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  if (!(dayName in map)) {
    throw Error("Invalid date");
  }

  return map[dayName];
}

/**
 * Get the local parts of a date in a given time zone
 * @param input - The date and time zone to get the local parts for
 * @returns The local parts of the date
 */
export function getLocalParts(input: {
  date: Date;
  timeZone: string;
}): LocalParts {
  return {
    year: Number(formatInTimeZone(input.date, input.timeZone, "yyyy")),
    month: Number(formatInTimeZone(input.date, input.timeZone, "M")),
    day: Number(formatInTimeZone(input.date, input.timeZone, "d")),
    hour: Number(formatInTimeZone(input.date, input.timeZone, "H")),
    minute: Number(formatInTimeZone(input.date, input.timeZone, "m")),
    second: Number(formatInTimeZone(input.date, input.timeZone, "s")),
  };
}

/**
 * Make a UTC date from local parts
 * @param input - The local parts and time zone to make a UTC date from
 * @returns The UTC date
 */
export function makeUTCDateFromLocalParts(input: {
  parts: LocalParts;
  timeZone: string;
}): Date {
  const isoLocal = `${input.parts.year.toString().padStart(4, "0")}-${input.parts.month
    .toString()
    .padStart(
      2,
      "0"
    )}-${input.parts.day.toString().padStart(2, "0")}T${input.parts.hour
    .toString()
    .padStart(2, "0")}:${input.parts.minute
    .toString()
    .padStart(
      2,
      "0"
    )}:${(input.parts.second ?? 0).toString().padStart(2, "0")}`;

  return fromZonedTime(isoLocal, input.timeZone);
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
