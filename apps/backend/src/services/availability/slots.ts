import {
  AvailableSlotsRequest,
  AvailableSlotsResponse,
} from "@instride/api/contracts";
import { JS_WEEKDAY_TO_DAY_OF_WEEK, timeToMinutes } from "@instride/shared";
import { LessonInstanceStatus } from "@instride/shared/models/enums";
import { addMinutes, eachDayOfInterval, parseISO } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { api, APIError } from "encore.dev/api";
import { availability, boards, lessons, organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";

import { memberRepo } from "../organizations/members/member.repo";
import { resolveEffectiveBusinessHours } from "./business-hours/utils";

interface Window {
  start: number; // minutes from local midnight
  end: number;
}

interface Interval {
  start: Date;
  end: Date;
}

const SLOT_STEP_MINUTES = 30;

export const getAvailableSlots = api(
  {
    expose: true,
    method: "GET",
    path: "/lessons/available-slots",
    auth: true,
  },
  async (request: AvailableSlotsRequest): Promise<AvailableSlotsResponse> => {
    const { organizationId } = requireOrganizationAuth();
    assertValidDateRange(request.startDate, request.endDate);

    const ctx = await loadAvailabilityContext({ ...request, organizationId });
    if (!ctx) return { slots: [] };

    const slots = ctx.days.flatMap((day) =>
      generateSlotsForDay({
        ymd: day.ymd,
        dayOfWeek: day.dayOfWeek,
        bookableWindows: day.bookableWindows,
        service: ctx.service,
        timezone: ctx.timezone,
        now: ctx.now,
        busyIntervals: ctx.busyIntervals,
      })
    );

    return {
      slots: slots.map((slot) => ({
        ...slot,
        service: {
          id: ctx.service.id,
          name: ctx.service.name,
          duration: ctx.service.duration,
          price: ctx.service.price,
        },
      })),
    };
  }
);

// ----------------------------------------------------------------------------
// Stage 1: load and validate everything we need to compute slots.
// Returns null when no slots are possible (level mismatch, can't self-add, etc.)
// so the caller can short-circuit to an empty response.
// ----------------------------------------------------------------------------

async function loadAvailabilityContext(input: {
  organizationId: string;
  serviceId: string;
  riderId: string;
  trainerId: string;
  boardId: string;
  startDate: string;
  endDate: string;
}) {
  const { service } = await boards.getService({ id: input.serviceId });
  if (!service || service.organizationId !== input.organizationId) {
    throw APIError.notFound("Service not found");
  }
  if (!service.canRiderAdd) return null;

  const rider = await memberRepo.findOneRider(
    input.riderId,
    input.organizationId
  );
  if (
    service.restrictedToLevelId &&
    rider.ridingLevelId &&
    service.restrictedToLevelId !== rider.ridingLevelId
  ) {
    return null;
  }

  const trainer = await memberRepo.findOneTrainer(
    input.trainerId,
    input.organizationId
  );

  const { organization } = await organizations.getById({
    id: input.organizationId,
  });
  const timezone = organization.timezone;

  const [orgBusinessHours, trainerBusinessHours, lessonInstances, timeBlocks] =
    await Promise.all([
      availability.listOrganizationBusinessHours(),
      availability.listTrainerBusinessHours({ trainerId: input.trainerId }),
      lessons
        .listLessonInstances({
          from: input.startDate,
          to: input.endDate,
          boardId: input.boardId,
          trainerId: input.trainerId,
        })
        .then((r) => r.instances),
      availability
        .listTimeBlocks({ trainerId: input.trainerId })
        .then((r) => r.timeBlocks),
    ]);

  const effectiveOrgHours = resolveEffectiveBusinessHours(
    orgBusinessHours,
    input.boardId
  );
  const effectiveTrainerHours = resolveEffectiveBusinessHours(
    trainerBusinessHours,
    input.boardId
  );

  const now = new Date();
  const todayYmd = formatInTimeZone(now, timezone, "yyyy-MM-dd");

  // Pre-compute the per-day shape: bookable windows after intersecting
  // org hours with trainer hours. Days where either is closed are dropped.
  const days = eachDayOfInterval({
    start: parseISO(input.startDate),
    end: parseISO(input.endDate),
  })
    .map((date) => {
      const ymd = formatInTimeZone(date, timezone, "yyyy-MM-dd");
      const jsWeekday = Number(formatInTimeZone(date, timezone, "i")) % 7;
      const dayOfWeek = JS_WEEKDAY_TO_DAY_OF_WEEK[jsWeekday];

      const isToday = ymd === todayYmd;
      if (isToday && !trainer.allowSameDayBookings) return null;

      const orgDay = effectiveOrgHours[dayOfWeek];
      const trainerDay = effectiveTrainerHours[dayOfWeek];
      if (!orgDay?.isOpen || !trainerDay?.isOpen) return null;

      const bookableWindows = intersectWindows(
        orgDay.slots.map(toMinuteWindow),
        trainerDay.slots.map(toMinuteWindow)
      );
      if (bookableWindows.length === 0) return null;

      return { ymd, dayOfWeek, bookableWindows };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  // Pre-compute busy intervals as Date pairs once. Saves re-parsing per slot.
  const busyIntervals: Interval[] = [
    ...lessonInstances
      .filter((i) => i.status === LessonInstanceStatus.SCHEDULED)
      .map((i) => ({ start: new Date(i.start), end: new Date(i.end) })),
    ...timeBlocks.map((b) => ({
      start: new Date(b.start),
      end: new Date(b.end),
    })),
  ];

  return { service, timezone, now, days, busyIntervals };
}

// ----------------------------------------------------------------------------
// Stage 2: walk a single day's bookable windows in 30-min steps,
// emit slots that fit the service duration and don't conflict.
// ----------------------------------------------------------------------------

function generateSlotsForDay(input: {
  ymd: string;
  dayOfWeek: string;
  bookableWindows: Window[];
  service: { duration: number };
  timezone: string;
  now: Date;
  busyIntervals: Interval[];
}) {
  const slots: Array<{ start: string; end: string; dayOfWeek: string }> = [];

  for (const window of input.bookableWindows) {
    for (
      let minute = roundUpToStep(window.start);
      minute + input.service.duration <= window.end;
      minute += SLOT_STEP_MINUTES
    ) {
      const start = fromZonedTime(
        `${input.ymd}T${minutesToHHMM(minute)}:00`,
        input.timezone
      );
      const end = addMinutes(start, input.service.duration);

      if (start <= input.now) continue;
      if (overlapsAny({ start, end }, input.busyIntervals)) continue;

      slots.push({
        start: start.toISOString(),
        end: end.toISOString(),
        dayOfWeek: input.dayOfWeek,
      });
    }
  }

  return slots;
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function assertValidDateRange(startDate: string, endDate: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
  ) {
    throw APIError.invalidArgument("startDate and endDate must be YYYY-MM-DD");
  }
  if (startDate > endDate) {
    throw APIError.invalidArgument(
      "startDate must be before or equal to endDate"
    );
  }
}

function intersectWindows(a: Window[], b: Window[]): Window[] {
  const result: Window[] = [];
  for (const aw of a) {
    for (const bw of b) {
      const start = Math.max(aw.start, bw.start);
      const end = Math.min(aw.end, bw.end);
      if (start < end) result.push({ start, end });
    }
  }
  return result;
}

function toMinuteWindow(slot: { openTime: string; closeTime: string }): Window {
  return {
    start: timeToMinutes(slot.openTime),
    end: timeToMinutes(slot.closeTime),
  };
}

function overlapsAny(slot: Interval, busy: Interval[]): boolean {
  return busy.some((b) => slot.start < b.end && slot.end > b.start);
}

function roundUpToStep(minute: number): number {
  return Math.ceil(minute / SLOT_STEP_MINUTES) * SLOT_STEP_MINUTES;
}

function minutesToHHMM(minute: number): string {
  const h = Math.floor(minute / 60)
    .toString()
    .padStart(2, "0");
  const m = (minute % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
