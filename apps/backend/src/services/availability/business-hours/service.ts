import { DayOfWeek } from "@instride/shared";
import { and, eq, inArray, sql } from "drizzle-orm";

import { Database, Transaction } from "@/shared/utils/schema";

import { db } from "../db";
import {
  organizationAvailability,
  organizationAvailabilitySlots,
  trainerAvailability,
  trainerAvailabilitySlots,
} from "../schema";

export const createBusinessHoursService = (
  client: Database | Transaction = db
) => ({
  // ============================================================================
  // Reads
  // ============================================================================

  findOrganizationDays: async (params: { organizationId: string }) => {
    return await client.query.organizationAvailability.findMany({
      where: { organizationId: params.organizationId },
      with: { slots: true },
    });
  },

  findTrainerDays: async (params: {
    organizationId: string;
    trainerId: string;
  }) => {
    return await client.query.trainerAvailability.findMany({
      where: {
        organizationId: params.organizationId,
        trainerId: params.trainerId,
      },
      with: { slots: true },
    });
  },

  findOrganizationDaysForResolve: async (params: {
    organizationId: string;
    boardId: string | null;
  }) => {
    const boardCondition = params.boardId
      ? {
          OR: [
            { boardId: params.boardId },
            { boardId: { isNull: true as const } },
          ],
        }
      : { boardId: { isNull: true as const } };

    return await client.query.organizationAvailability.findMany({
      where: {
        organizationId: params.organizationId,
        ...boardCondition,
      },
      with: { slots: true },
    });
  },

  findTrainerDaysForResolve: async (params: {
    organizationId: string;
    trainerId: string;
    boardId: string | null;
  }) => {
    const boardCondition = params.boardId
      ? {
          OR: [
            { boardId: params.boardId },
            { boardId: { isNull: true as const } },
          ],
        }
      : { boardId: { isNull: true as const } };

    return await client.query.trainerAvailability.findMany({
      where: {
        organizationId: params.organizationId,
        trainerId: params.trainerId,
        ...boardCondition,
      },
      with: { slots: true },
    });
  },

  // ============================================================================
  // Org writes
  // ============================================================================

  upsertOrganizationDays: async (params: {
    organizationId: string;
    boardId: string | null;
    days: Array<{ dayOfWeek: DayOfWeek; isOpen: boolean }>;
  }) => {
    const dayValues = params.days.map((day) => ({
      organizationId: params.organizationId,
      boardId: params.boardId,
      dayOfWeek: day.dayOfWeek,
      isOpen: day.isOpen,
    }));

    return await client
      .insert(organizationAvailability)
      .values(dayValues)
      .onConflictDoUpdate({
        target: [
          organizationAvailability.organizationId,
          organizationAvailability.boardId,
          organizationAvailability.dayOfWeek,
        ],
        set: {
          isOpen: sql`excluded.is_open`,
          updatedAt: sql`now()`,
        },
      })
      .returning({
        id: organizationAvailability.id,
        dayOfWeek: organizationAvailability.dayOfWeek,
      });
  },

  deleteOrganizationSlots: async (params: { availabilityIds: string[] }) => {
    if (params.availabilityIds.length === 0) return;
    await client
      .delete(organizationAvailabilitySlots)
      .where(
        inArray(
          organizationAvailabilitySlots.availabilityId,
          params.availabilityIds
        )
      );
  },

  insertOrganizationSlots: async (
    slots: Array<{
      availabilityId: string;
      openTime: string;
      closeTime: string;
    }>
  ) => {
    if (slots.length === 0) return;
    await client.insert(organizationAvailabilitySlots).values(slots);
  },

  resetOrganizationBoardHours: async (params: {
    organizationId: string;
    boardId: string;
  }) => {
    await client
      .delete(organizationAvailability)
      .where(
        and(
          eq(organizationAvailability.organizationId, params.organizationId),
          eq(organizationAvailability.boardId, params.boardId)
        )
      );
  },

  // ============================================================================
  // Trainer writes
  // ============================================================================

  upsertTrainerDays: async (params: {
    organizationId: string;
    trainerId: string;
    boardId: string | null;
    days: Array<{ dayOfWeek: DayOfWeek; isOpen: boolean }>;
  }) => {
    const dayValues = params.days.map((day) => ({
      organizationId: params.organizationId,
      trainerId: params.trainerId,
      boardId: params.boardId,
      dayOfWeek: day.dayOfWeek,
      isOpen: day.isOpen,
    }));

    return await client
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
  },

  deleteTrainerSlots: async (params: { availabilityIds: string[] }) => {
    if (params.availabilityIds.length === 0) return;
    await client
      .delete(trainerAvailabilitySlots)
      .where(
        inArray(trainerAvailabilitySlots.availabilityId, params.availabilityIds)
      );
  },

  insertTrainerSlots: async (
    slots: Array<{
      availabilityId: string;
      openTime: string;
      closeTime: string;
    }>
  ) => {
    if (slots.length === 0) return;
    await client.insert(trainerAvailabilitySlots).values(slots);
  },

  resetTrainerBoardHours: async (params: {
    organizationId: string;
    trainerId: string;
    boardId: string;
  }) => {
    await client
      .delete(trainerAvailability)
      .where(
        and(
          eq(trainerAvailability.organizationId, params.organizationId),
          eq(trainerAvailability.trainerId, params.trainerId),
          eq(trainerAvailability.boardId, params.boardId)
        )
      );
  },
});

export const businessHoursService = createBusinessHoursService();
