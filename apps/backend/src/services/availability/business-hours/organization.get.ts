import { api } from "encore.dev/api";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import { ListBusinessHoursResponse } from "../types/contracts";

export const listOrganizationBusinessHours = api(
  {
    method: "GET",
    path: "/business-hours/organization",
    expose: true,
    auth: true,
  },
  async (): Promise<ListBusinessHoursResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const rows = await db.query.organizationAvailability.findMany({
      where: {
        organizationId,
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
