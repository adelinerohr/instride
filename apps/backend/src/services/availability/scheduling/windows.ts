import { getLocalParts } from "@instride/shared/utils/date";
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
