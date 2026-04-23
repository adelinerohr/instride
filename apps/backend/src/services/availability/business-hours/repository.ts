import { Database, Transaction } from "@/shared/utils/schema";

import { ListBusinessHoursResponse } from "../types/contracts";
import { BusinessHours } from "../types/models";

export async function getBusinessHours(params: {
  client: Database | Transaction;
  type: "organization" | "trainer";
  organizationId: string;
  trainerId?: string;
}): Promise<ListBusinessHoursResponse> {
  let rows: BusinessHours[];

  if (params.type === "organization") {
    rows = await params.client.query.organizationAvailability.findMany({
      where: {
        organizationId: params.organizationId,
      },
      with: {
        slots: true,
      },
    });
  } else {
    rows = await params.client.query.trainerAvailability.findMany({
      where: {
        organizationId: params.organizationId,
        trainerId: params.trainerId,
      },
      with: {
        slots: true,
      },
    });
  }

  const defaults = rows.filter((row) => row.boardId === null);
  const boardRows = rows.filter(
    (row): row is (typeof rows)[number] & { boardId: string } =>
      row.boardId !== null
  );

  const boardOverrides: Record<string, typeof boardRows> = {};
  for (const row of boardRows) {
    if (!boardOverrides[row.boardId]) {
      boardOverrides[row.boardId] = [];
    }
    boardOverrides[row.boardId].push(row);
  }

  return {
    defaults,
    boardOverrides,
  };
}
