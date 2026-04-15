import type { types } from "@instride/api";
import { getDayOfWeek, timeToMinutes } from "@instride/shared";

import type { EffectiveBusinessHours } from "../lib/types";

export function resolveEffectiveBusinessHours(
  businessHours: types.ListBusinessHoursResponse,
  boardId?: string
): EffectiveBusinessHours {
  const rows =
    (boardId && businessHours.boardOverrides[boardId]) ||
    businessHours.defaults;

  return Object.fromEntries(
    rows.map((day) => [
      day.dayOfWeek,
      {
        isOpen: day.isOpen,
        startTime: day.openTime?.slice(0, 5) ?? null,
        endTime: day.closeTime?.slice(0, 5) ?? null,
        dayOfWeek: day.dayOfWeek,
        boardId: boardId ?? null,
      },
    ])
  ) as EffectiveBusinessHours;
}

export function isWorkingHour(
  day: Date,
  hour: number,
  businessHours: EffectiveBusinessHours | undefined
): boolean {
  if (!businessHours) return false; // ← treat missing hours as non-working

  const dayKey = getDayOfWeek(day);
  const dayHours = businessHours[dayKey];

  if (!dayHours?.isOpen || !dayHours.startTime || !dayHours.endTime)
    return false;

  const slotStart = hour * 60;
  const open = timeToMinutes(dayHours.startTime);
  const close = timeToMinutes(dayHours.endTime);

  return slotStart >= open && slotStart < close;
}
