import { api } from "encore.dev/api";

import { db } from "@/database";
import { assertAdminOrSelf } from "@/services/auth/gates";
import { requireOrganizationAuth } from "@/shared/auth";

import { ListBusinessHoursResponse } from "../types/contracts";

export const listTrainerBusinessHours = api(
  {
    method: "GET",
    path: "/business-hours/trainer/:trainerId",
    expose: true,
    auth: true,
  },
  async ({
    trainerId,
  }: {
    trainerId: string;
  }): Promise<ListBusinessHoursResponse> => {
    const { userID, organizationId } = requireOrganizationAuth();
    await assertAdminOrSelf(organizationId, userID, trainerId);

    const rows = await db.query.trainerAvailability.findMany({
      where: {
        organizationId,
        trainerId,
      },
    });

    const defaults = rows.filter((row) => row.boardId === null);
    const boardRows = rows.filter((row) => row.boardId !== null);

    const boardOverrides: Record<string, typeof boardRows> = {};
    for (const row of boardRows) {
      if (!boardOverrides[row.boardId!]) {
        boardOverrides[row.boardId!] = [];
      }
      boardOverrides[row.boardId!].push(row);
    }

    return {
      defaults,
      boardOverrides,
    };
  }
);
