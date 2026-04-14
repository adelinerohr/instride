import { and, eq } from "drizzle-orm";
import { api } from "encore.dev/api";

import { db } from "@/database";
import { assertAdmin } from "@/services/auth/gates";
import { DayHours } from "@/services/availability/types/models";
import { requireOrganizationAuth } from "@/shared/auth";

import { organizationAvailability } from "../schema";
import { validateDayHours } from "./utils";

export interface UpdateOrganizationBusinessHoursRequest {
  boardId: string | null;
  days: DayHours[];
}

export const updateOrganizationBusinessHours = api(
  {
    method: "PUT",
    path: "/business-hours/organization",
    expose: true,
    auth: true,
  },
  async ({
    boardId,
    days,
  }: UpdateOrganizationBusinessHoursRequest): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    validateDayHours(days);

    const values = days.map((day) => ({
      organizationId: organizationId,
      boardId,
      dayOfWeek: day.dayOfWeek,
      isOpen: day.isOpen,
      openTime: day.isOpen ? day.openTime : null,
      closeTime: day.isOpen ? day.closeTime : null,
    }));

    await db
      .insert(organizationAvailability)
      .values(values)
      .onConflictDoUpdate({
        target: [
          organizationAvailability.organizationId,
          organizationAvailability.boardId,
          organizationAvailability.dayOfWeek,
        ],
        set: {
          isOpen: organizationAvailability.isOpen,
          openTime: organizationAvailability.openTime,
          closeTime: organizationAvailability.closeTime,
          updatedAt: new Date(),
        },
      })
      .returning();
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

    // Reset board business hours to the organization's default
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
