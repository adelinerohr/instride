import { startOfDay } from "date-fns";
import type { CSSProperties } from "react";

import { SLOT_HEIGHT, START_HOUR } from "../lib/constants";

/**
 * Returns CSS properties for absolutely positioning an event block within a day column.
 *
 * @param start       - Event start time
 * @param day         - The calendar day this column represents
 * @param laneIndex   - Which overlap lane this event is in (0-based)
 * @param laneCount   - Total number of overlap lanes for this day
 */
export function getEventBlockStyle(
  start: Date,
  day: Date,
  laneIndex: number,
  laneCount: number
): CSSProperties {
  const dayStart = startOfDay(day);
  // If an event starts before the visible day start, clamp to day start
  const effectiveStart = start < dayStart ? dayStart : start;

  const hoursFromDayStart =
    effectiveStart.getHours() - START_HOUR + effectiveStart.getMinutes() / 60;
  const top = hoursFromDayStart * SLOT_HEIGHT;

  const width = 100 / laneCount;
  const left = laneIndex * width;

  return { top: `${top}px`, width: `${width}%`, left: `${left}%` };
}

/** Height in pixels for an event given its start and end times. Minimum 20px. */
export function getEventBlockHeight(start: Date, end: Date): number {
  const durationMinutes = (end.getTime() - start.getTime()) / 60_000;
  return Math.max((durationMinutes / 60) * SLOT_HEIGHT - 4, 20);
}
