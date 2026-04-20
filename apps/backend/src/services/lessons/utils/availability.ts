import {
  EventScope,
  getLocalParts,
  LessonInstanceStatus,
} from "@instride/shared";
import { getDayOfWeek } from "@instride/shared";
import { APIError } from "encore.dev/api";

import { resolveEffectiveWeekHours } from "@/services/availability/business-hours/utils";

import { db } from "../db";

export interface AvailabilityWindow {
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:MM'
  endTime: string; // 'HH:MM'
  trainerId: string;
  boardId: string;
}

export enum AvailabilityViolationType {
  OUTSIDE_BUSINESS_HOURS = "outside_business_hours",
  TRAINER_CONFLICT = "trainer_conflict",
  EVENT_BLOCK = "event_block",
}

export interface AvailabilityViolation {
  type: AvailabilityViolationType;
  message: string;
  // For event block, surface the event so the UI can show it
  eventId?: string;
  eventTitle?: string;
}

export interface CheckAvailabilityInput {
  organizationId: string;
  window: AvailabilityWindow;
}

export async function checkLessonAvailability(
  input: CheckAvailabilityInput
): Promise<AvailabilityViolation[]> {
  const violations: AvailabilityViolation[] = [];

  const [hoursViolation, conflictViolation, eventViolation] = await Promise.all(
    [
      checkBusinessHours(input),
      checkTrainerConflicts(input),
      checkEventBlocks(input),
    ]
  );

  if (hoursViolation) violations.push(hoursViolation);
  if (conflictViolation) violations.push(conflictViolation);
  if (eventViolation) violations.push(eventViolation);

  return violations;
}

export async function checkBusinessHours(
  input: CheckAvailabilityInput
): Promise<AvailabilityViolation | null> {
  const effectiveHours = await resolveEffectiveWeekHours({
    organizationId: input.organizationId,
    trainerId: input.window.trainerId,
    boardId: input.window.boardId,
  });

  const dayOfWeek = getDayOfWeek(new Date(input.window.date));
  const hours = effectiveHours[dayOfWeek];

  if (!hours || !hours.isOpen || hours.slots.length === 0) {
    return {
      type: AvailabilityViolationType.OUTSIDE_BUSINESS_HOURS,
      message: "Trainer is not available on this day",
    };
  }

  // Lesson must fit entirely inside at least one slot
  const fitsInSomeSlot = hours.slots.some(
    (slot) =>
      input.window.startTime >= slot.openTime &&
      input.window.endTime <= slot.closeTime
  );

  if (!fitsInSomeSlot) {
    const ranges = hours.slots
      .map((s) => `${s.openTime.slice(0, 5)} - ${s.closeTime.slice(0, 5)}`)
      .join(", ");
    return {
      type: AvailabilityViolationType.OUTSIDE_BUSINESS_HOURS,
      message: `Trainer is not available during this time. Lesson must be within ${ranges}.`,
    };
  }

  return null;
}

export async function checkTrainerConflicts(
  input: CheckAvailabilityInput
): Promise<AvailabilityViolation | null> {
  const startTime = new Date(`${input.window.date}T${input.window.startTime}`);
  const endTime = new Date(`${input.window.date}T${input.window.endTime}`);

  const conflictingLesson = await db.query.lessonInstances.findFirst({
    where: {
      organizationId: input.organizationId,
      trainerId: input.window.trainerId,
      boardId: input.window.boardId,
      status: LessonInstanceStatus.SCHEDULED,
      start: {
        lt: endTime,
      },
      end: {
        gt: startTime,
      },
    },
  });

  if (conflictingLesson) {
    return {
      type: AvailabilityViolationType.TRAINER_CONFLICT,
      message: "Trainer already has a lesson scheduled during this time",
    };
  }

  const conflictingTimeBlock = await db.query.timeBlocks.findFirst({
    where: {
      trainerId: input.window.trainerId,
      start: {
        lt: endTime,
      },
      end: {
        gt: startTime,
      },
    },
  });

  if (conflictingTimeBlock) {
    return {
      type: AvailabilityViolationType.TRAINER_CONFLICT,
      message: "Trainer has a time block conflicting with this lesson",
    };
  }

  return null;
}

export async function checkEventBlocks(
  input: CheckAvailabilityInput
): Promise<AvailabilityViolation | null> {
  // Find events that overlap with the lesson window
  const overlappingEvents = await db.query.events.findMany({
    with: {
      schedulingBlocks: true,
    },
    where: {
      organizationId: input.organizationId,
      startDate: {
        lte: input.window.date,
      },
      endDate: {
        gte: input.window.date,
      },
      blockScheduling: true,
      OR: [
        {
          schedulingBlocks: {
            scope: EventScope.ORGANIZATION,
          },
        },
        {
          schedulingBlocks: {
            scope: EventScope.BOARD,
            boardId: input.window.boardId,
          },
        },
        {
          schedulingBlocks: {
            scope: EventScope.TRAINER,
            trainerId: input.window.trainerId,
          },
        },
      ],
    },
  });

  if (overlappingEvents.length === 0) return null;

  // For timed events, check time overlap
  for (const event of overlappingEvents) {
    const isAllDay = !event.startTime && !event.endTime;

    if (isAllDay) {
      return {
        type: AvailabilityViolationType.EVENT_BLOCK,
        message: `Scheduling is blocked due to ${event.title}`,
        eventId: event.id,
        eventTitle: event.title,
      };
    }

    // Timed event - check actual time overlap
    const eventStart = event.startTime;
    const eventEnd = event.endTime;

    if (
      eventStart &&
      eventEnd &&
      input.window.startTime < eventEnd &&
      input.window.endTime > eventStart
    ) {
      return {
        type: AvailabilityViolationType.EVENT_BLOCK,
        message: `Scheduling is blocked due to ${event.title}`,
        eventId: event.id,
        eventTitle: event.title,
      };
    }
  }

  return null;
}

export function buildAvailabilityWindow(input: {
  start: string;
  duration: number;
  trainerId: string;
  boardId: string;
  timeZone: string;
}): { startDate: Date; endDate: Date; window: AvailabilityWindow } {
  const startDate = new Date(input.start);
  if (Number.isNaN(startDate.getTime())) {
    throw APIError.invalidArgument("Invalid start date");
  }
  const endDate = new Date(startDate.getTime() + input.duration * 60_000);

  const startParts = getLocalParts({
    date: startDate,
    timeZone: input.timeZone,
  });
  const endParts = getLocalParts({ date: endDate, timeZone: input.timeZone });
  const pad = (n: number) => n.toString().padStart(2, "0");

  return {
    startDate,
    endDate,
    window: {
      date: `${startParts.year}-${pad(startParts.month)}-${pad(startParts.day)}`,
      startTime: `${pad(startParts.hour)}:${pad(startParts.minute)}`,
      endTime: `${pad(endParts.hour)}:${pad(endParts.minute)}`,
      trainerId: input.trainerId,
      boardId: input.boardId,
    },
  };
}
