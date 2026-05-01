import {
  DayOfWeek,
  EffectiveBusinessHours,
  EventScope,
  isWithinAnySlot,
  JS_WEEKDAY_TO_DAY_OF_WEEK,
} from "@instride/shared";
import { addMinutes } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import type { Event, LessonInstance, TimeBlock } from "#contracts";

export type AvailabilityResult = { ok: true } | { ok: false; reason: string };

export function checkTrainerAvailability(input: {
  start: Date;
  durationMinutes: number;
  trainerId: string;
  boardId: string;
  trainerBusinessHours: EffectiveBusinessHours;
  organizationBusinessHours: EffectiveBusinessHours;
  events: Event[];
  timeBlocks: TimeBlock[];
  lessons: LessonInstance[];
  timezone: string;
}): AvailabilityResult {
  const end = addMinutes(input.start, input.durationMinutes);

  // Resolve day-of-week key in the org timezone
  const jsWeekday =
    Number(formatInTimeZone(input.start, input.timezone, "i")) % 7;
  const dayKey: DayOfWeek = JS_WEEKDAY_TO_DAY_OF_WEEK[jsWeekday] as DayOfWeek;

  const startTime = formatInTimeZone(input.start, input.timezone, "HH:mm");
  const endTime = formatInTimeZone(end, input.timezone, "HH:mm");

  // 1. Trainer business hours
  const trainerSlots =
    input.trainerBusinessHours[dayKey as keyof EffectiveBusinessHours]?.slots ??
    [];
  if (!isWithinAnySlot({ startTime, endTime, slots: trainerSlots })) {
    return {
      ok: false,
      reason: "Outside trainer business hours",
    };
  }

  // 2. Organization business hours
  const orgSlots =
    input.organizationBusinessHours[dayKey as keyof EffectiveBusinessHours]
      ?.slots ?? [];
  if (!isWithinAnySlot({ startTime, endTime, slots: orgSlots })) {
    return {
      ok: false,
      reason: "Outside facility hours",
    };
  }

  const startMs = input.start.getTime();
  const endMs = end.getTime();

  // 3. Trainer's existing lessons
  const lessonConflict = input.lessons.some((l) => {
    if (l.trainerId !== input.trainerId) return false;
    const ls = new Date(l.start).getTime();
    const le = new Date(l.end).getTime();
    return startMs < le && endMs > ls;
  });
  if (lessonConflict) {
    return { ok: false, reason: "Trainer has another lesson at this time" };
  }

  // 4. Trainer time blocks
  const blockConflict = input.timeBlocks.some((b) => {
    if (b.trainerId !== input.trainerId) return false;
    const bs = new Date(b.start).getTime();
    const be = new Date(b.end).getTime();
    return startMs < be && endMs > bs;
  });
  if (blockConflict) {
    return { ok: false, reason: "Trainer is unavailable at this time" };
  }

  // 5. Event scheduling-block conflicts
  const slotDate = formatInTimeZone(input.start, input.timezone, "yyyy-MM-dd");
  const conflictingEvent = input.events.find((event) => {
    if (!event.blockScheduling) return false;

    // Does this event apply to this trainer / board?
    if (event.scope === EventScope.ORGANIZATION) {
      // applies to everyone
    } else if (event.scope === EventScope.TRAINER) {
      if (!event.trainerIds?.includes(input.trainerId)) return false;
    } else if (event.scope === EventScope.BOARD) {
      if (!event.boardIds?.includes(input.boardId)) return false;
    }

    // Does the slot's date fall within the event's date range?
    if (slotDate < event.startDate || slotDate > event.endDate) return false;

    // All-day event blocks the whole slot's date
    if (!event.startTime || !event.endTime) return true;

    // Timed event: check time overlap on this specific day.
    // Event blocks startTime–endTime in org-local on every date in range.
    const eventStart = fromZonedTime(
      `${slotDate}T${event.startTime}`,
      input.timezone
    );
    const eventEnd = fromZonedTime(
      `${slotDate}T${event.endTime}`,
      input.timezone
    );
    return startMs < eventEnd.getTime() && endMs > eventStart.getTime();
  });

  if (conflictingEvent) {
    return { ok: false, reason: "Conflicts with a scheduled event" };
  }

  return { ok: true };
}
