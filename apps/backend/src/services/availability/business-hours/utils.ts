import { DayOfWeek } from "@instride/shared";
import { APIError } from "encore.dev/api";

import { db } from "@/database";

import {
  DayHours,
  EffectiveDayHours,
  EffectiveDayHoursSource,
  OrganizationBusinessHours,
  TrainerBusinessHours,
} from "../types/models";

export function validateDayHours(days: DayHours[]): void {
  for (const day of days) {
    if (day.isOpen) {
      if (day.openTime === null || day.closeTime === null) {
        throw APIError.invalidArgument(
          "Open and close times are required for open days"
        );
      }
      if (day.openTime >= day.closeTime) {
        throw APIError.invalidArgument("Open time must be before close time");
      }
    }
  }
}

/**
 * Resolve the effective day hours for a given organization, trainer, day of week, and board
 * @param organizationId - The organization ID
 * @param trainerId - The trainer ID
 * @param dayOfWeek - The day of week
 * @param boardId - The board ID
 * @returns The effective day hours
 */
export async function resolveEffectiveDayHours({
  organizationId,
  trainerId,
  dayOfWeek,
  boardId,
}: {
  organizationId: string;
  trainerId?: string;
  dayOfWeek: DayOfWeek;
  boardId: string | null;
}): Promise<EffectiveDayHours | null> {
  const week = await resolveEffectiveWeekHours({
    organizationId,
    trainerId,
    boardId,
  });
  return week[dayOfWeek];
}

/**
 * Resolve the effective week hours for a given organization, trainer, and board
 * @param organizationId - The organization ID
 * @param trainerId - The trainer ID (optional -> depending on the caller)
 * @param boardId - The board ID
 * @returns The effective week hours
 */
export async function resolveEffectiveWeekHours({
  organizationId,
  trainerId,
  boardId,
}: {
  organizationId: string;
  trainerId?: string;
  boardId: string | null;
}): Promise<Record<DayOfWeek, EffectiveDayHours | null>> {
  const boardCondition = boardId
    ? {
        OR: [{ boardId }, { boardId: { isNull: true as const } }],
      }
    : { boardId: { isNull: true as const } };

  // One query per table — fetch both board-specific and default rows at once
  const orgRows = await db.query.organizationAvailability.findMany({
    where: {
      organizationId,
      ...boardCondition,
    },
  });

  const trainerRows = trainerId
    ? await db.query.trainerAvailability.findMany({
        where: {
          organizationId,
          trainerId,
          ...boardCondition,
        },
      })
    : [];

  // Index rows by day for 0(1) lookup - board-specific rows win over defaults
  const orgByDay = indexByDay(orgRows, boardId);
  const trainerByDay = indexByDay(trainerRows, boardId);

  return Object.fromEntries(
    Object.values(DayOfWeek).map((day) => [
      day,
      resolveDay(day, orgByDay, trainerByDay, trainerId),
    ])
  ) as Record<DayOfWeek, EffectiveDayHours | null>;
}

/**
 * Resolve the effective day hours for a given day, organization, trainer, and board
 * @param day - The day of week
 * @param orgByDay - The organization business hours by day
 * @param trainerByDay - The trainer business hours by day
 * @param trainerId - The trainer ID
 * @returns The effective day hours
 */
function resolveDay(
  day: DayOfWeek,
  orgByDay: Map<DayOfWeek, OrganizationBusinessHours>,
  trainerByDay: Map<DayOfWeek, TrainerBusinessHours>,
  trainerId?: string
): EffectiveDayHours | null {
  const orgRow = orgByDay.get(day);

  const effectiveOrgHours: EffectiveDayHours | null = orgRow
    ? {
        dayOfWeek: orgRow.dayOfWeek,
        isOpen: orgRow.isOpen,
        openTime: orgRow.openTime,
        closeTime: orgRow.closeTime,
        source: orgRow.boardId
          ? EffectiveDayHoursSource.BOARD_OVERRIDE
          : EffectiveDayHoursSource.ORGANIZATION_DEFAULT,
      }
    : null;

  if (!trainerId) return effectiveOrgHours;

  const trainerRow = trainerByDay.get(day);

  if (!trainerRow || trainerRow.inheritsFromOrg) return effectiveOrgHours;

  return {
    dayOfWeek: trainerRow.dayOfWeek,
    isOpen: trainerRow.isOpen,
    openTime: trainerRow.openTime,
    closeTime: trainerRow.closeTime,
    source: trainerRow.boardId
      ? EffectiveDayHoursSource.TRAINER_BOARD_OVERRIDE
      : EffectiveDayHoursSource.TRAINER_DEFAULT,
  };
}

/**
 * Index rows by day, preferring board-specific over null-boardId rows
 * @param rows - The rows to index
 * @param boardId - The board ID to index by
 * @returns A map of day of week to the row
 */
function indexByDay<T extends { dayOfWeek: DayOfWeek; boardId: string | null }>(
  rows: T[],
  boardId: string | null
): Map<DayOfWeek, T> {
  const map = new Map<DayOfWeek, T>();

  for (const row of rows) {
    const existing = map.get(row.dayOfWeek);

    // Board-specific beats general — only overwrite if incoming row is more specific
    if (
      !existing ||
      (boardId && row.boardId === boardId && existing.boardId === null)
    ) {
      map.set(row.dayOfWeek, row);
    }
  }
  return map;
}
