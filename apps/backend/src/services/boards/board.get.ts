import { api, APIError } from "encore.dev/api";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import { GetBoardResponse, ListBoardsResponse } from "./types/contracts";

interface ListBoardsRequest {
  memberId?: string;
  isTrainer?: boolean;
}

export const listBoards = api(
  {
    method: "GET",
    path: "/boards",
    expose: true,
    auth: true,
  },
  async (request: ListBoardsRequest): Promise<ListBoardsResponse> => {
    const { organizationId } = requireOrganizationAuth();

    let memberCondition: {} | undefined = undefined;

    if (request.memberId && request.isTrainer !== undefined) {
      memberCondition = {
        assignments: {
          memberId: request.memberId,
          isTrainer: request.isTrainer,
        },
      };
    } else if (request.memberId) {
      memberCondition = {
        assignments: {
          memberId: request.memberId,
        },
      };
    }

    const boards = await db.query.boards.findMany({
      where: {
        organizationId,
        ...memberCondition,
      },
      with: {
        assignments: {
          with: {
            trainer: {
              with: {
                member: {
                  with: {
                    authUser: true,
                  },
                },
              },
            },
          },
        },
        serviceBoardAssignments: true,
      },
    });

    return { boards };
  }
);

export const getBoard = api(
  {
    method: "GET",
    path: "/boards/:boardId",
    expose: true,
    auth: true,
  },
  async ({ boardId }: { boardId: string }): Promise<GetBoardResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const board = await db.query.boards.findFirst({
      where: {
        id: boardId,
        organizationId,
      },
      with: {
        assignments: true,
        serviceBoardAssignments: {
          with: {
            service: true,
          },
        },
      },
    });

    if (!board) {
      throw APIError.notFound("Board not found");
    }

    return { board };
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
    const boards = await db.query.boards.findMany({
      where: {
        assignments: {
          trainerId,
        },
      },
    });
    return { boards };
  }
);

export const getBoardsForRider = api(
  {
    method: "GET",
    path: "/boards/rider/:riderId",
    expose: true,
    auth: true,
  },
  async ({ riderId }: { riderId: string }): Promise<ListBoardsResponse> => {
    const boards = await db.query.boards.findMany({
      where: {
        assignments: {
          riderId,
        },
      },
    });
    return { boards };
  }
);
