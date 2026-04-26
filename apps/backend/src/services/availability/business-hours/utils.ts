import type { BusinessHoursDay } from "@instride/api/contracts";
import { DayHours, DayOfWeek, TimeSlot, timeToMinutes } from "@instride/shared";
import { APIError } from "encore.dev/api";

import { Database, Transaction } from "@/shared/utils/schema";

import { toBusinessHoursDay } from "../mappers";
import { createBusinessHoursService } from "./service";

// ============================================================================
// Validation (unchanged)
// ============================================================================

export function validateDayHours(days: DayHours[]): void {
  for (const day of days) {
    if (!day.isOpen && day.slots.length > 0) {
      throw APIError.invalidArgument(
        `Closed days must not have any slots: ${day.dayOfWeek}`
      );
    }
    if (!day.isOpen) continue;

    if (day.slots.length === 0) {
      throw APIError.invalidArgument(
        `Open days must have at least one slot: ${day.dayOfWeek}`
      );
    }

    for (const slot of day.slots) {
      if (slot.openTime >= slot.closeTime) {
        throw APIError.invalidArgument(
          `Open time must be before close time: ${day.dayOfWeek}`
        );
      }
    }

    assertNoOverlap(day.slots, day.dayOfWeek);
  }
}

function assertNoOverlap(slots: TimeSlot[], dayOfWeek: DayOfWeek): void {
  const sorted = [...slots].sort((a, b) =>
    a.openTime < b.openTime ? -1 : a.openTime > b.openTime ? 1 : 0
  );

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (curr.openTime < prev.closeTime) {
      throw APIError.invalidArgument(
        `Slots for ${dayOfWeek} overlap (${prev.openTime}-${prev.closeTime} and ${curr.openTime}-${curr.closeTime})`
      );
    }
  }
}

export function assertTrainerSlotsClampedToOrg(input: {
  trainerSlots: TimeSlot[];
  orgSlots: TimeSlot[];
  dayOfWeek: DayOfWeek;
}): void {
  if (input.trainerSlots.length === 0) return;

  if (input.orgSlots.length === 0) {
    throw APIError.invalidArgument(
      `Trainer hours for ${input.dayOfWeek} cannot be set because the organization is closed that day`
    );
  }

  for (const trainerSlot of input.trainerSlots) {
    const trainerOpen = timeToMinutes(trainerSlot.openTime);
    const trainerClose = timeToMinutes(trainerSlot.closeTime);

    const fits = input.orgSlots.some((orgSlot) => {
      const orgOpen = timeToMinutes(orgSlot.openTime);
      const orgClose = timeToMinutes(orgSlot.closeTime);
      return trainerOpen >= orgOpen && trainerClose <= orgClose;
    });

    if (!fits) {
      const ranges = input.orgSlots
        .map((s) => `${s.openTime}-${s.closeTime}`)
        .join(", ");
      throw APIError.invalidArgument(
        `Trainer slot ${trainerSlot.openTime}-${trainerSlot.closeTime} for ${input.dayOfWeek} ` +
          `does not fit inside organization hours (${ranges})`
      );
    }
  }
}

// ============================================================================
// Resolution
// ============================================================================

export async function resolveEffectiveDayHours(input: {
  organizationId: string;
  trainerId?: string;
  dayOfWeek: DayOfWeek;
  boardId: string | null;
  client?: Database | Transaction;
}): Promise<BusinessHoursDay | null> {
  const week = await resolveEffectiveWeekHours(input);
  return week[input.dayOfWeek];
}

export async function resolveEffectiveWeekHours(input: {
  organizationId: string;
  trainerId?: string;
  boardId: string | null;
  client?: Database | Transaction;
}): Promise<Record<DayOfWeek, BusinessHoursDay | null>> {
  const service = createBusinessHoursService(input.client);

  const orgRows = await service.findOrganizationDaysForResolve({
    organizationId: input.organizationId,
    boardId: input.boardId,
  });

  const trainerRows = input.trainerId
    ? await service.findTrainerDaysForResolve({
        organizationId: input.organizationId,
        trainerId: input.trainerId,
        boardId: input.boardId,
      })
    : [];

  const orgByDay = indexByDay(orgRows, input.boardId);
  const trainerByDay = indexByDay(trainerRows, input.boardId);

  return Object.fromEntries(
    Object.values(DayOfWeek).map((day) => [
      day,
      resolveDay({ day, orgByDay, trainerByDay, trainerId: input.trainerId }),
    ])
  ) as Record<DayOfWeek, BusinessHoursDay | null>;
}

function resolveDay<
  TRow extends Parameters<typeof toBusinessHoursDay>[0],
>(input: {
  day: DayOfWeek;
  orgByDay: Map<DayOfWeek, TRow>;
  trainerByDay: Map<DayOfWeek, TRow>;
  trainerId?: string;
}): BusinessHoursDay | null {
  const trainerRow = input.trainerId
    ? input.trainerByDay.get(input.day)
    : undefined;

  if (trainerRow) {
    return toBusinessHoursDay(trainerRow);
  }

  const orgRow = input.orgByDay.get(input.day);
  if (!orgRow) return null;

  return toBusinessHoursDay(orgRow);
}

function indexByDay<T extends { dayOfWeek: DayOfWeek; boardId: string | null }>(
  rows: T[],
  boardId: string | null
): Map<DayOfWeek, T> {
  const map = new Map<DayOfWeek, T>();

  for (const row of rows) {
    const existing = map.get(row.dayOfWeek);
    if (
      !existing ||
      (boardId && row.boardId === boardId && existing.boardId === null)
    ) {
      map.set(row.dayOfWeek, row);
    }
  }
  return map;
}

// ============================================================================
// Calendar projection (unchanged)
// ============================================================================

export type EffectiveBusinessHours = Record<DayOfWeek, BusinessHoursDay>;
export type TrainerEffectiveBusinessHours = Record<
  string,
  EffectiveBusinessHours
>;

type ListBusinessHoursBundle<TRow extends BusinessHoursDay> = {
  defaults: TRow[];
  boardOverrides: Record<string, Array<TRow & { boardId: string }>>;
};

function sortSlots<T extends TimeSlot>(slots: T[]): T[] {
  return [...slots].sort((a, b) =>
    a.openTime < b.openTime ? -1 : a.openTime > b.openTime ? 1 : 0
  );
}

export function resolveEffectiveBusinessHours<TRow extends BusinessHoursDay>(
  businessHours: ListBusinessHoursBundle<TRow>,
  boardId?: string
): EffectiveBusinessHours {
  const rows =
    (boardId && businessHours.boardOverrides[boardId]) ||
    businessHours.defaults;
  const byDay = new Map(
    rows.map(
      (day) => [day.dayOfWeek, { ...day, slots: sortSlots(day.slots) }] as const
    )
  );
  return Object.fromEntries(
    Object.values(DayOfWeek).map((dow) => {
      const row = byDay.get(dow);
      return [
        dow,
        {
          dayOfWeek: dow,
          isOpen: row?.isOpen ?? false,
          slots: sortSlots(row?.slots ?? []),
        } satisfies BusinessHoursDay,
      ];
    })
  ) as EffectiveBusinessHours;
}
