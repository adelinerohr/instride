import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import { DayOfWeek } from "../models/enums";
import { DAYS_OF_WEEK } from "./formatters";

export interface LocalParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
}

export interface DayHours {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export interface TrainerDayHours extends DayHours {
  inheritsFromOrg: boolean;
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
 * Check if a time range falls within business hours
 * @param startTime - The start time to check in the format "HH:MM"
 * @param endTime - The end time to check in the format "HH:MM"
 * @param hours - The hours to check
 * @returns Whether the time range falls within business hours
 */
export function isWithinHours(
  startTime: string,
  endTime: string,
  hours: {
    openTime: string | null;
    closeTime: string | null;
    isOpen: boolean;
  }
): boolean {
  if (!hours.isOpen || !hours.openTime || !hours.closeTime) return false;

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const open = timeToMinutes(hours.openTime);
  const close = timeToMinutes(hours.closeTime);

  return start >= open && end <= close;
}

/**
 * Build an empty week of day hours
 * @returns An array of empty day hours
 */
export function buildEmptyWeek(): DayHours[] {
  return Object.values(DayOfWeek).map((day) => ({
    dayOfWeek: day,
    isOpen: false,
    openTime: null,
    closeTime: null,
  }));
}

/**
 * Build an empty week of trainer day hours
 * @returns An array of empty trainer day hours
 */
export function buildEmptyTrainerWeek(): TrainerDayHours[] {
  return Object.values(DayOfWeek).map((day) => ({
    dayOfWeek: day,
    isOpen: false,
    openTime: null,
    closeTime: null,
    inheritsFromOrg: true,
  }));
}

/**
 * Convert a date to a day of week
 * @param date - The date to convert to a day of week
 * @returns The day of week
 */
export function getDayOfWeek(date: Date): DayOfWeek {
  const day = DAYS_OF_WEEK[date.getDay()];

  if (!day) {
    throw Error("Invalid date");
  }

  return day.value;
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

  if (!map[dayName]) {
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
