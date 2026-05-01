import type {
  GetBoardResponse,
  ListBoardsForRiderRequest,
  ListBoardsForRiderResponse,
  ListBoardsForTrainerRequest,
  ListBoardsForTrainerResponse,
  ListBoardsRequest,
  ListBoardsResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { boardRepo } from "./board.repo";
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

    const row = await boardRepo.findOne(boardId, organizationId);

    return { board: toBoard(row) };
  }
);

export const listBoardsForRider = api(
  {
    method: "GET",
    path: "/boards/rider/:riderId",
    expose: true,
    auth: true,
  },
  async (
    request: ListBoardsForRiderRequest
  ): Promise<ListBoardsForRiderResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const boards = await boardRepo.findMany({
      organizationId,
      filter: {
        type: "rider",
        id: request.riderId,
      },
      canRiderAdd: request.canRiderAdd,
    });
    return { boards: boards.map(toBoard) };
  }
);

export const listBoardsForTrainer = api(
  {
    method: "GET",
    path: "/boards/trainer/:trainerId",
    expose: true,
    auth: true,
  },
  async (
    request: ListBoardsForTrainerRequest
  ): Promise<ListBoardsForTrainerResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const boards = await boardRepo.findMany({
      organizationId,
      filter: {
        type: "trainer",
        id: request.trainerId,
      },
    });
    return { boards: boards.map(toBoard) };
  }
);
