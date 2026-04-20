import { DayHours, DayOfWeek } from "@instride/shared";
import { and, eq, inArray, sql } from "drizzle-orm";
import { api } from "encore.dev/api";

import { db } from "@/database";
import { assertAdmin, assertAdminOrSelf } from "@/services/auth/gates";
import { requireOrganizationAuth } from "@/shared/auth";

import {
  organizationAvailability,
  organizationAvailabilitySlots,
  trainerAvailability,
  trainerAvailabilitySlots,
} from "../schema";
import {
  ListOrganizationBusinessHoursResponse,
  ListTrainerBusinessHoursResponse,
} from "../types/contracts";
import { getBusinessHours } from "./repository";
import {
  assertTrainerSlotsClampedToOrg,
  resolveEffectiveWeekHours,
  validateDayHours,
} from "./utils";

// ---------------------------------------------------------------------------
// Organization business hours
// ---------------------------------------------------------------------------

export interface UpdateOrganizationBusinessHoursParams {
  boardId: string | null;
  days: DayHours[];
}

/**
 * Replace the organization (or board-override) business hours for the given days.
 *
 * For each day:
 *   1. Upsert the day-row (organizationId, boardId, dayOfWeek) with its isOpen flag.
 *   2. Delete all existing slots for that day-row.
 *   3. Insert the new slots (if the day is open).
 *
 * All wrapped in a transaction so partial writes never leak through. The
 * post-write list read happens on the same tx so we return a snapshot that's
 * guaranteed consistent with what we just wrote.
 *
 * The unique constraint on (organizationId, boardId, dayOfWeek) uses
 * NULLS NOT DISTINCT so org-default rows (boardId = NULL) participate in
 * uniqueness and the conflict path fires correctly.
 */
export const updateOrganizationBusinessHours = api(
  {
    method: "PUT",
    path: "/business-hours/organization",
    expose: true,
    auth: true,
  },
  async (
    params: UpdateOrganizationBusinessHoursParams
  ): Promise<ListOrganizationBusinessHoursResponse> => {
    const { organizationId } = requireOrganizationAuth();
    validateDayHours(params.days);

    return await db.transaction(async (tx) => {
      // Upsert all day-rows in one statement, returning their ids so we can
      // replace slots in bulk.
      const dayValues = params.days.map((day) => ({
        organizationId,
        boardId: params.boardId,
        dayOfWeek: day.dayOfWeek,
        isOpen: day.isOpen,
      }));

      const upserted = await tx
        .insert(organizationAvailability)
        .values(dayValues)
        .onConflictDoUpdate({
          target: [
            organizationAvailability.organizationId,
            organizationAvailability.boardId,
            organizationAvailability.dayOfWeek,
          ],
          set: {
            // `excluded` refers to the row we tried to insert — without this
            // the SET is a no-op and toggling a day open/closed wouldn't
            // actually flip isOpen on existing rows.
            isOpen: sql`excluded.is_open`,
            updatedAt: sql`now()`,
          },
        })
        .returning({
          id: organizationAvailability.id,
          dayOfWeek: organizationAvailability.dayOfWeek,
        });

      const idByDay = new Map(upserted.map((r) => [r.dayOfWeek, r.id]));
      const touchedIds = upserted.map((r) => r.id);

      // Clear any existing slots for the affected day-rows
      if (touchedIds.length > 0) {
        await tx
          .delete(organizationAvailabilitySlots)
          .where(
            inArray(organizationAvailabilitySlots.availabilityId, touchedIds)
          );
      }

      // Insert fresh slots for every open day
      const slotValues = params.days.flatMap((day) => {
        if (!day.isOpen) return [];
        const availabilityId = idByDay.get(day.dayOfWeek);
        if (!availabilityId) return [];
        return day.slots.map((slot) => ({
          availabilityId,
          openTime: slot.openTime,
          closeTime: slot.closeTime,
        }));
      });

      if (slotValues.length > 0) {
        await tx.insert(organizationAvailabilitySlots).values(slotValues);
      }

      return await getBusinessHours({
        type: "organization",
        client: tx,
        organizationId,
      });
    });
  }
);

export const resetBoardBusinessHours = api(
  {
    method: "DELETE",
    path: "/business-hours/organization/boards/:boardId",
    expose: true,
    auth: true,
  },
  async ({ boardId }: { boardId: string }): Promise<void> => {
    const { userID, organizationId } = requireOrganizationAuth();
    await assertAdmin(organizationId, userID);

    // Slots cascade via FK when their parent day-row is deleted
    await db
      .delete(organizationAvailability)
      .where(
        and(
          eq(organizationAvailability.organizationId, organizationId),
          eq(organizationAvailability.boardId, boardId)
        )
      );
  }
);

// ---------------------------------------------------------------------------
// Trainer business hours
// ---------------------------------------------------------------------------

export interface UpdateTrainerBusinessHoursParams {
  trainerId: string;
  boardId: string | null;
  days: DayHours[];
}

/**
 * Replace a trainer's business hours for the given days.
 *
 * Clamping: each trainer slot must fit entirely inside one of the effective
 * org/board slots for that day. A trainer cannot open when the org is closed,
 * and cannot open earlier or later than the org's slots allow.
 */
export const updateTrainerBusinessHours = api(
  {
    method: "PUT",
    path: "/business-hours/trainer/:trainerId",
    expose: true,
    auth: true,
  },
  async (
    params: UpdateTrainerBusinessHoursParams
  ): Promise<ListTrainerBusinessHoursResponse> => {
    const { userID, organizationId } = requireOrganizationAuth();
    await assertAdminOrSelf(organizationId, userID, params.trainerId);

    validateDayHours(params.days);

    // Resolve the effective org/board week hours once, then clamp each day.
    // We pass no trainerId here so we get the pure org-side effective hours,
    // which is what trainer hours must fit inside.
    const effectiveOrgWeek = await resolveEffectiveWeekHours({
      organizationId,
      boardId: params.boardId,
    });

    for (const day of params.days) {
      if (!day.isOpen || day.slots.length === 0) continue;

      const orgDay = effectiveOrgWeek[day.dayOfWeek];
      const orgSlots = orgDay?.isOpen ? orgDay.slots : [];
      assertTrainerSlotsClampedToOrg({
        trainerSlots: day.slots,
        orgSlots,
        dayOfWeek: day.dayOfWeek,
      });
    }

    return await db.transaction(async (tx) => {
      const dayValues = params.days.map((day) => ({
        organizationId,
        trainerId: params.trainerId,
        boardId: params.boardId,
        dayOfWeek: day.dayOfWeek,
        isOpen: day.isOpen,
      }));

      // Check if there is an existing day-row

      const upserted = await tx
        .insert(trainerAvailability)
        .values(dayValues)
        .onConflictDoUpdate({
          target: [
            trainerAvailability.trainerId,
            trainerAvailability.boardId,
            trainerAvailability.dayOfWeek,
          ],
          set: {
            isOpen: sql`excluded.is_open`,
            updatedAt: sql`now()`,
          },
        })
        .returning({
          id: trainerAvailability.id,
          dayOfWeek: trainerAvailability.dayOfWeek,
        });

      const idByDay = new Map<DayOfWeek, string>(
        upserted.map((r) => [r.dayOfWeek, r.id])
      );
      const touchedIds = upserted.map((r) => r.id);

      if (touchedIds.length > 0) {
        await tx
          .delete(trainerAvailabilitySlots)
          .where(inArray(trainerAvailabilitySlots.availabilityId, touchedIds));
      }

      const slotValues = params.days.flatMap((day) => {
        if (!day.isOpen) return [];
        const availabilityId = idByDay.get(day.dayOfWeek);
        if (!availabilityId) return [];
        return day.slots.map((slot) => ({
          availabilityId,
          openTime: slot.openTime,
          closeTime: slot.closeTime,
        }));
      });

      if (slotValues.length > 0) {
        await tx.insert(trainerAvailabilitySlots).values(slotValues);
      }

      return await getBusinessHours({
        type: "trainer",
        client: tx,
        organizationId,
        trainerId: params.trainerId,
      });
    });
  }
);

export const resetTrainerBoardBusinessHours = api(
  {
    method: "DELETE",
    path: "/business-hours/trainer/:trainerId/boards/:boardId",
    expose: true,
    auth: true,
  },
  async (params: { trainerId: string; boardId: string }): Promise<void> => {
    const { userID, organizationId } = requireOrganizationAuth();
    await assertAdminOrSelf(organizationId, userID, params.trainerId);

    // Slots cascade via FK
    await db
      .delete(trainerAvailability)
      .where(
        and(
          eq(trainerAvailability.organizationId, organizationId),
          eq(trainerAvailability.trainerId, params.trainerId),
          eq(trainerAvailability.boardId, params.boardId)
        )
      );
  }
);
