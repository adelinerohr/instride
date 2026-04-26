import type {
  ListBusinessHoursResponse,
  UpdateOrganizationBusinessHoursRequest,
  UpdateTrainerBusinessHoursRequest,
} from "@instride/api/contracts";
import { DayOfWeek } from "@instride/shared";
import { api } from "encore.dev/api";

import { assertAdmin, assertAdminOrSelf } from "@/services/auth/gates";
import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { toBoardBusinessHours, toBusinessHours } from "../mappers";
import { businessHoursService, createBusinessHoursService } from "./service";
import {
  assertTrainerSlotsClampedToOrg,
  resolveEffectiveWeekHours,
  validateDayHours,
} from "./utils";

function buildResponse(
  rows: Parameters<typeof toBusinessHours>[0][]
): ListBusinessHoursResponse {
  const defaults = rows
    .filter((row) => row.boardId === null)
    .map(toBusinessHours);

  const boardOverrides: ListBusinessHoursResponse["boardOverrides"] = {};
  for (const row of rows) {
    if (row.boardId === null) continue;
    if (!boardOverrides[row.boardId]) {
      boardOverrides[row.boardId] = [];
    }
    boardOverrides[row.boardId].push(
      toBoardBusinessHours(row as typeof row & { boardId: string })
    );
  }

  return { defaults, boardOverrides };
}

export const updateOrganizationBusinessHours = api(
  {
    method: "PUT",
    path: "/business-hours/organization",
    expose: true,
    auth: true,
  },
  async (
    params: UpdateOrganizationBusinessHoursRequest
  ): Promise<ListBusinessHoursResponse> => {
    const { organizationId } = requireOrganizationAuth();
    validateDayHours(params.days);

    return await db.transaction(async (tx) => {
      const service = createBusinessHoursService(tx);

      const upserted = await service.upsertOrganizationDays({
        organizationId,
        boardId: params.boardId,
        days: params.days,
      });

      const idByDay = new Map(upserted.map((r) => [r.dayOfWeek, r.id]));
      const touchedIds = upserted.map((r) => r.id);

      await service.deleteOrganizationSlots({ availabilityIds: touchedIds });

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

      await service.insertOrganizationSlots(slotValues);

      const rows = await service.findOrganizationDays({ organizationId });
      return buildResponse(rows);
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

    await businessHoursService.resetOrganizationBoardHours({
      organizationId,
      boardId,
    });
  }
);

export const updateTrainerBusinessHours = api(
  {
    method: "PUT",
    path: "/business-hours/trainer/:trainerId",
    expose: true,
    auth: true,
  },
  async (
    params: UpdateTrainerBusinessHoursRequest
  ): Promise<ListBusinessHoursResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const trainer = await db.query.trainers.findFirst({
      where: { id: params.trainerId, organizationId },
    });
    assertExists(trainer, "Trainer not found");
    await assertAdminOrSelf(trainer.memberId);

    validateDayHours(params.days);

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
      const service = createBusinessHoursService(tx);

      const upserted = await service.upsertTrainerDays({
        organizationId,
        trainerId: params.trainerId,
        boardId: params.boardId,
        days: params.days,
      });

      const idByDay = new Map<DayOfWeek, string>(
        upserted.map((r) => [r.dayOfWeek as DayOfWeek, r.id])
      );
      const touchedIds = upserted.map((r) => r.id);

      await service.deleteTrainerSlots({ availabilityIds: touchedIds });

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

      await service.insertTrainerSlots(slotValues);

      const rows = await service.findTrainerDays({
        organizationId,
        trainerId: params.trainerId,
      });
      return buildResponse(rows);
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
    const { organizationId } = requireOrganizationAuth();

    const trainer = await db.query.trainers.findFirst({
      where: { id: params.trainerId, organizationId },
    });
    assertExists(trainer, "Trainer not found");
    await assertAdminOrSelf(trainer.memberId);

    await businessHoursService.resetTrainerBoardHours({
      organizationId,
      trainerId: params.trainerId,
      boardId: params.boardId,
    });
  }
);
