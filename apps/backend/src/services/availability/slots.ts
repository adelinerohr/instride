import { DayOfWeek, getDOWInTimeZone, timeToMinutes } from "@instride/shared";
import { LessonInstanceStatus } from "@instride/shared/models/enums";
import { isSameDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { api } from "encore.dev/api";
import { APIError } from "encore.dev/api";
import { availability, boards, lessons, organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";

import { resolveEffectiveBusinessHours } from "./business-hours/utils";

interface AvailableSlotsParams {
  boardId: string;
  trainerId: string;
  serviceId: string;
  riderId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

interface AvailableSlot {
  start: string;
  end: string;
  dayOfWeek: string;
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
}

interface AvailableSlotResponse {
  slots: AvailableSlot[];
}

/** JavaScript weekday from `getDOWInTimeZone` (Sun=0 … Sat=6) → app `DayOfWeek` */
const JS_WEEKDAY_TO_DAY_OF_WEEK: DayOfWeek[] = [
  DayOfWeek.SUN,
  DayOfWeek.MON,
  DayOfWeek.TUE,
  DayOfWeek.WED,
  DayOfWeek.THU,
  DayOfWeek.FRI,
  DayOfWeek.SAT,
];

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

/**
 * Get available time slots for booking a lesson
 *
 * Generates time slots based on:
 * - Organization business hours
 * - Trainer business hours (for the specific board)
 * - Service duration
 * - Date range
 *
 * Filters out:
 * - Times that conflict with existing lessons
 * - Trainer time blocks (unavailability)
 * - Past time slots
 * - Slots restricted by rider level
 */
export const getAvailableSlots = api(
  {
    expose: true,
    method: "GET",
    path: "/lessons/available-slots",
    auth: true,
  },
  async (params: AvailableSlotsParams): Promise<AvailableSlotResponse> => {
    const { organizationId } = requireOrganizationAuth();

    assertValidDateRange(params.startDate, params.endDate);

    // Get the service
    const { service } = await boards.getService({ id: params.serviceId });
    if (!service || service.organizationId !== organizationId) {
      throw APIError.notFound("Service not found");
    }

    // Check if service allows rider to add lessons
    if (!service.canRiderAdd) {
      return { slots: [] };
    }

    // Get rider's member profile to check level restrictions
    const { rider } = await organizations.getRider({ riderId: params.riderId });

    // Check if rider meets level requirements
    if (service.restrictedToLevelId && rider.ridingLevelId) {
      if (service.restrictedToLevelId !== rider.ridingLevelId) {
        return { slots: [] };
      }
    }

    // Get trainer's member profile to check same-day booking setting
    const { trainer } = await organizations.getTrainer({
      trainerId: params.trainerId,
    });

    const allowSameDayBookings = trainer.allowSameDayBookings;

    // Get organization for timezone
    const { organization } = await organizations.getById({
      id: organizationId,
    });

    const timezone = organization.timezone;

    // Get business hours for organization and trainer
    const orgBusinessHours = await availability.listOrganizationBusinessHours();
    const effectiveOrgBusinessHours = resolveEffectiveBusinessHours(
      orgBusinessHours,
      params.boardId
    );
    const trainerBusinessHours = await availability.listTrainerBusinessHours({
      trainerId: params.trainerId,
    });
    const effectiveTrainerBusinessHours = resolveEffectiveBusinessHours(
      trainerBusinessHours,
      params.boardId
    );

    // Get all existing lessons for this trainer on this board in the date range
    const { instances: lessonInstances } = await lessons.listLessonInstances({
      from: params.startDate,
      to: params.endDate,
      boardId: params.boardId,
      trainerId: params.trainerId,
    });
    const existingLessons = lessonInstances.filter(
      (instance) => instance.status === LessonInstanceStatus.SCHEDULED
    );

    // Get trainer's time blocks (unavailability)
    const { timeBlocks } = await availability.listTimeBlocks({
      trainerId: params.trainerId,
    });

    // Generate available time slots
    const slots: Array<{
      start: string;
      end: string;
      dayOfWeek: string;
    }> = [];

    // Get current time to filter out past slots
    const now = new Date();

    // Round current time up to nearest 30 minutes
    const nowInTz = toZonedTime(now, timezone);
    const currentMinutesInDay = nowInTz.getHours() * 60 + nowInTz.getMinutes();
    const roundedUpMinutes = Math.ceil(currentMinutesInDay / 30) * 30;

    // Iterate through each day in the range
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const localDate = toZonedTime(currentDate, timezone);
      const jsWeekday = getDOWInTimeZone({
        date: localDate,
        timeZone: timezone,
      });
      const dayOfWeek = JS_WEEKDAY_TO_DAY_OF_WEEK[jsWeekday];

      // Check if this is today
      const isToday = isSameDay(localDate, nowInTz);

      if (isToday && !allowSameDayBookings) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Get business hours for this day
      const orgHoursForDay = effectiveOrgBusinessHours[dayOfWeek];
      const trainerHoursForDay = effectiveTrainerBusinessHours[dayOfWeek];

      // If either org or trainer doesn't work this day, skip
      if (
        !orgHoursForDay?.isOpen ||
        !trainerHoursForDay?.isOpen ||
        !orgHoursForDay.startTime ||
        !orgHoursForDay.endTime ||
        !trainerHoursForDay.startTime ||
        !trainerHoursForDay.endTime
      ) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      const orgStart = timeToMinutes(orgHoursForDay.startTime);
      const orgEnd = timeToMinutes(orgHoursForDay.endTime);
      const trainerStart = timeToMinutes(trainerHoursForDay.startTime);
      const trainerEnd = timeToMinutes(trainerHoursForDay.endTime);
      const slotStart = Math.max(trainerStart, orgStart);
      const slotEnd = Math.min(trainerEnd, orgEnd);

      if (slotStart < slotEnd) {
        // For today, start from rounded up current time, otherwise start from business hours
        let currentMinutes = isToday
          ? Math.max(slotStart, roundedUpMinutes)
          : slotStart;

        // Round to nearest 30-minute interval
        currentMinutes = Math.ceil(currentMinutes / 30) * 30;

        while (currentMinutes + service.duration <= slotEnd) {
          // Create a date in the organization's local timezone
          const localHours = Math.floor(currentMinutes / 60);
          const localMinutes = currentMinutes % 60;

          // Create a date object representing this time in the local timezone
          const slotDateInLocalTZ = new Date(localDate);
          slotDateInLocalTZ.setHours(localHours, localMinutes, 0, 0);

          // Convert from local timezone to UTC using fromZonedTime
          const slotDateUTC = fromZonedTime(slotDateInLocalTZ, timezone);

          const slotStartISO = slotDateUTC.toISOString();
          const slotEndDate = new Date(
            slotDateUTC.getTime() + service.duration * 60000
          );
          const slotEndISO = slotEndDate.toISOString();

          // Skip slots that are in the past
          if (slotDateUTC.getTime() <= now.getTime()) {
            currentMinutes += 30;
            continue;
          }

          // Check if this slot conflicts with existing lessons or time blocks
          const hasConflict =
            existingLessons.some((lesson) => {
              const lessonStart = new Date(lesson.start).getTime();
              const lessonEnd = new Date(lesson.end).getTime();
              const slotStartTime = slotDateUTC.getTime();
              const slotEndTime = slotEndDate.getTime();

              // Check for overlap
              return slotStartTime < lessonEnd && slotEndTime > lessonStart;
            }) ||
            timeBlocks.some((block) => {
              const blockStart = new Date(block.start).getTime();
              const blockEnd = new Date(block.end).getTime();
              const slotStartTime = slotDateUTC.getTime();
              const slotEndTime = slotEndDate.getTime();

              // Check for overlap
              return slotStartTime < blockEnd && slotEndTime > blockStart;
            });

          if (!hasConflict) {
            slots.push({
              start: slotStartISO,
              end: slotEndISO,
              dayOfWeek,
            });
          }

          // Move to next slot (30-minute intervals)
          currentMinutes += 30;
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Return slots with service metadata
    const result = slots.map((slot) => ({
      start: slot.start,
      end: slot.end,
      dayOfWeek: slot.dayOfWeek,
      service: {
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: service.price,
      },
    }));

    return { slots: result };
  }
);
