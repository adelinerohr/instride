import { DayOfWeek } from "@instride/shared";
import { timeToMinutes } from "@instride/shared";
import { and, eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";

import { db } from "@/database";
import { assertAdminOrSelf } from "@/services/auth/gates";
import { requireOrganizationAuth } from "@/shared/auth";

import { trainerAvailability } from "../schema";
import { type ListTrainerBusinessHoursResponse } from "../types/contracts";
import { TrainerDayHours } from "../types/models";
import { resolveEffectiveDayHours, validateDayHours } from "./utils";

export interface UpdateTrainerBusinessHoursRequest {
  trainerId: string;
  boardId: string | null;
  days: TrainerDayHours[];
}

export const updateTrainerBusinessHours = api(
  {
    method: "PUT",
    path: "/business-hours/trainer/:trainerId",
    expose: true,
    auth: true,
  },
  async ({
    trainerId,
    boardId,
    days,
  }: UpdateTrainerBusinessHoursRequest): Promise<ListTrainerBusinessHoursResponse> => {
    const { userID, organizationId } = requireOrganizationAuth();
    await assertAdminOrSelf(organizationId, userID, trainerId);

    validateDayHours(days);

    const orgHours = Object.fromEntries(
      await Promise.all(
        Object.values(DayOfWeek).map(async (day) => [
          day,
          await resolveEffectiveDayHours({
            organizationId,
            dayOfWeek: day,
            boardId,
          }),
        ])
      )
    );

    const rows = days.map((day) => {
      if (day.inheritsFromOrg) {
        return {
          organizationId,
          trainerId,
          boardId: boardId ?? null,
          dayOfWeek: day.dayOfWeek,
          inheritsFromOrg: true,
          isOpen: false,
          openTime: null as string | null,
          closeTime: null as string | null,
        };
      }

      // Clamp trainer hours to within organization hours
      let openTime = day.isOpen ? day.openTime : null;
      let closeTime = day.isOpen ? day.closeTime : null;

      if (orgHours?.isOpen && openTime && closeTime) {
        const orgOpen = timeToMinutes(orgHours.openTime);
        const orgClose = timeToMinutes(orgHours.closeTime);
        const trainerOpen = timeToMinutes(openTime);
        const trainerClose = timeToMinutes(closeTime);

        if (trainerOpen < orgOpen || trainerClose > orgClose) {
          throw APIError.invalidArgument(
            `Trainer hours for ${day.dayOfWeek} exceed organization hours ` +
              `(${orgHours.openTime}-${orgHours.closeTime})`
          );
        }
      }

      return {
        organizationId,
        trainerId,
        boardId: boardId ?? null,
        dayOfWeek: day.dayOfWeek,
        inheritsFromOrg: false,
        isOpen: day.isOpen,
        openTime,
        closeTime,
      };
    });

    const result = await db
      .insert(trainerAvailability)
      .values(rows)
      .onConflictDoUpdate({
        target: [
          trainerAvailability.trainerId,
          trainerAvailability.boardId,
          trainerAvailability.dayOfWeek,
        ],
        set: {
          inheritsFromOrg: trainerAvailability.inheritsFromOrg,
          isOpen: trainerAvailability.isOpen,
          openTime: trainerAvailability.openTime,
          closeTime: trainerAvailability.closeTime,
          updatedAt: new Date(),
        },
      })
      .returning();

    return { businessHours: result };
  }
);

export const resetTrainerBoardBusinessHours = api(
  {
    method: "DELETE",
    path: "/business-hours/trainer/:trainerId/boards/:boardId",
    expose: true,
    auth: true,
  },
  async ({
    trainerId,
    boardId,
  }: {
    trainerId: string;
    boardId: string;
  }): Promise<void> => {
    const { userID, organizationId } = requireOrganizationAuth();
    await assertAdminOrSelf(organizationId, userID, trainerId);

    await db
      .delete(trainerAvailability)
      .where(
        and(
          eq(trainerAvailability.organizationId, organizationId),
          eq(trainerAvailability.trainerId, trainerId),
          eq(trainerAvailability.boardId, boardId)
        )
      );
  }
);
