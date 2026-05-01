import { addMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { APIError } from "encore.dev/api";

import { AvailabilityWindow } from "./check-availability";

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
  const endDate = addMinutes(startDate, input.duration);

  return {
    startDate,
    endDate,
    window: {
      date: formatInTimeZone(startDate, input.timeZone, "yyyy-MM-dd"),
      startTime: formatInTimeZone(startDate, input.timeZone, "HH:mm"),
      endTime: formatInTimeZone(endDate, input.timeZone, "HH:mm"),
      trainerId: input.trainerId,
      boardId: input.boardId,
    },
  };
}
