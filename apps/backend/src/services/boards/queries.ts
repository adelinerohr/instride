import type {
  GetBoardResponse,
  ListBoardsRequest,
  ListBoardsResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import { boardExpansion } from "./fragments";
import { toBoard } from "./mappers";

export const listBoards = api(
  { method: "GET", path: "/boards", expose: true, auth: true },
  async (request: ListBoardsRequest): Promise<ListBoardsResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const riderIds =
      request.riderIds ?? (request.riderId ? [request.riderId] : undefined);

    const assignmentFilter = request.trainerId
      ? { assignments: { trainerId: request.trainerId } }
      : riderIds && riderIds.length > 0
        ? { assignments: { riderId: { in: riderIds } } }
        : {};

    const rows = await db.query.boards.findMany({
      where: { organizationId, ...assignmentFilter },
      with: boardExpansion,
    });

    return { boards: rows.map(toBoard) };
  }
);

export const getBoard = api(
  { method: "GET", path: "/boards/:boardId", expose: true, auth: true },
  async ({ boardId }: { boardId: string }): Promise<GetBoardResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const row = await db.query.boards.findFirst({
      where: { id: boardId, organizationId },
      with: boardExpansion, // ← same expansion as listBoards now
    });

    assertExists(row, "Board not found");
    return { board: toBoard(row) };
  }
);

export const getBoardsForTrainer = api(
  {
    method: "GET",
    path: "/boards/trainer/:trainerId",
    expose: true,
    auth: true,
  },
  async ({ trainerId }: { trainerId: string }): Promise<ListBoardsResponse> => {
    const { organizationId } = requireOrganizationAuth(); // ← added org scoping

    const rows = await db.query.boards.findMany({
      where: {
        organizationId,
        assignments: { trainerId },
      },
      with: boardExpansion, // ← load full expansion, matches contract
    });

    return { boards: rows.map(toBoard) };
  }
);

export const getBoardsForRider = api(
  { method: "GET", path: "/boards/rider/:riderId", expose: true, auth: true },
  async ({ riderId }: { riderId: string }): Promise<ListBoardsResponse> => {
    const { organizationId } = requireOrganizationAuth(); // ← added org scoping

    const rows = await db.query.boards.findMany({
      where: {
        organizationId,
        assignments: { riderId },
      },
      with: boardExpansion, // ← load full expansion
    });

    return { boards: rows.map(toBoard) };
  }
);
