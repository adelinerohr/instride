import { DayHours, TrainerDayHours } from "../interfaces";
import { DayOfWeek } from "../models/enums";

/**
 * Parse "HH:MM" into total minutes from midnight
 * @param time - The time to convert to minutes in the format "HH:MM"
 * @returns The time in minutes
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
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
 * Convert a date to a day of week
 * @param date - The date to convert to a day of week
 * @returns The day of week
 */
export function dateToDayOfWeek(date: Date): DayOfWeek {
  const map: DayOfWeek[] = Object.values(DayOfWeek);
  return map[date.getDay()];
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
