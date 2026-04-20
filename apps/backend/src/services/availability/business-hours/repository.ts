import { Database, Transaction } from "@/shared/utils/schema";

import {
  ListOrganizationBusinessHoursResponse,
  ListTrainerBusinessHoursResponse,
} from "../types/contracts";
import {
  TrainerBusinessHours,
  OrganizationBusinessHours,
} from "../types/models";

interface GetOrganizationBusinessHoursInput {
  client: Database | Transaction;
  type: "organization";
  organizationId: string;
}

interface GetTrainerBusinessHoursInput {
  client: Database | Transaction;
  type: "trainer";
  organizationId: string;
  trainerId: string;
}

type GetBusinessHoursInput =
  | GetOrganizationBusinessHoursInput
  | GetTrainerBusinessHoursInput;

/**
 * Two overloaded versions of getBusinessHours to support the two different
 * input types.
 */
export async function getBusinessHours(
  input: GetOrganizationBusinessHoursInput
): Promise<ListOrganizationBusinessHoursResponse>;
export async function getBusinessHours(
  input: GetTrainerBusinessHoursInput
): Promise<ListTrainerBusinessHoursResponse>;

export async function getBusinessHours(
  input: GetBusinessHoursInput
): Promise<
  ListOrganizationBusinessHoursResponse | ListTrainerBusinessHoursResponse
> {
  let rows: (OrganizationBusinessHours | TrainerBusinessHours)[];

  if (input.type === "organization") {
    rows = await input.client.query.organizationAvailability.findMany({
      where: {
        organizationId: input.organizationId,
      },
      with: {
        slots: true,
      },
    });
  } else {
    rows = await input.client.query.trainerAvailability.findMany({
      where: {
        organizationId: input.organizationId,
        trainerId: input.trainerId,
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
