import type { ListBusinessHoursResponse } from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { assertAdminOrSelf } from "@/services/auth/gates";
import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { toBoardBusinessHours, toBusinessHours } from "../mappers";
import { businessHoursService } from "./service";

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

export const listOrganizationBusinessHours = api(
  {
    method: "GET",
    path: "/business-hours/organization",
    expose: true,
    auth: true,
  },
  async (): Promise<ListBusinessHoursResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const rows = await businessHoursService.findOrganizationDays({
      organizationId,
    });
    return buildResponse(rows);
  }
);

export const listTrainerBusinessHours = api(
  {
    method: "GET",
    path: "/business-hours/trainer/:trainerId",
    expose: true,
    auth: true,
  },
  async (params: { trainerId: string }): Promise<ListBusinessHoursResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const trainer = await db.query.trainers.findFirst({
      where: { id: params.trainerId, organizationId },
    });
    assertExists(trainer, "Trainer not found");
    await assertAdminOrSelf(trainer.memberId);

    const rows = await businessHoursService.findTrainerDays({
      organizationId,
      trainerId: params.trainerId,
    });
    return buildResponse(rows);
  }
);
