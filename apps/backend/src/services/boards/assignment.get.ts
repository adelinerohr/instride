import { api } from "encore.dev/api";

import { db } from "@/database";

import { ListBoardAssignmentsResponse } from "./types/contracts";

interface ListBoardAssignmentsRequest {
  boardId: string;
  type: "all" | "trainer" | "rider";
}

export const listBoardAssignments = api(
  {
    method: "GET",
    path: "/boards/:boardId/assignments",
    expose: true,
    auth: true,
  },
  async (
    request: ListBoardAssignmentsRequest
  ): Promise<ListBoardAssignmentsResponse> => {
    const typeCondition = {
      trainerId:
        request.type === "trainer"
          ? { isNotNull: true as const }
          : { isNull: true as const },
    };

    const assignments = await db.query.boardAssignments.findMany({
      where: {
        boardId: request.boardId,
        ...(request.type !== "all" ? typeCondition : {}),
      },
    });

    return { assignments };
  }
);

interface ListMemberAssignmentsRequest {
  memberId: string;
  isTrainer: boolean;
}

export const listMemberAssignments = api(
  {
    method: "GET",
    path: "/boards/assignments/:memberId",
    expose: true,
    auth: true,
  },
  async (
    request: ListMemberAssignmentsRequest
  ): Promise<ListBoardAssignmentsResponse> => {
    const whereCondition = request.isTrainer
      ? { trainerId: request.memberId }
      : { riderId: request.memberId };

    const assignments = await db.query.boardAssignments.findMany({
      where: {
        ...whereCondition,
      },
      with: {
        board: {
          with: {
            assignments: {
              where: {
                trainerId: {
                  isNotNull: true,
                },
              },
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
          },
        },
      },
    });

    return { assignments };
  }
);
