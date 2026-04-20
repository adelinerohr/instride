import { and, eq } from "drizzle-orm";
import { api } from "encore.dev/api";
import { boards as boardsApi } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";

import { db } from "./db";
import { boards } from "./schema";
import { GetBoardResponse } from "./types/contracts";

interface CreateBoardRequest {
  name: string;
  canRiderAdd?: boolean;
  trainerIds?: string[];
  serviceIds?: string[];
}

export const createBoard = api(
  {
    method: "POST",
    path: "/boards",
    expose: true,
    auth: true,
  },
  async (request: CreateBoardRequest): Promise<GetBoardResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const [board] = await db
      .insert(boards)
      .values({
        name: request.name,
        canRiderAdd: request.canRiderAdd,
        organizationId,
      })
      .returning();

    if (request.trainerIds) {
      for (const trainerId of request.trainerIds) {
        await boardsApi.assignToBoard({
          boardId: board.id,
          trainerId,
        });
      }
    }

    if (request.serviceIds) {
      for (const serviceId of request.serviceIds) {
        await boardsApi.assignToService({
          type: "board",
          serviceId,
          boardId: board.id,
        });
      }
    }

    return { board };
  }
);

interface UpdateBoardRequest {
  boardId: string;
  name?: string;
  canRiderAdd?: boolean;
  trainerIds?: string[];
  serviceIds?: string[];
}

export const updateBoard = api(
  {
    method: "PUT",
    path: "/boards/:boardId",
    expose: true,
    auth: true,
  },
  async (request: UpdateBoardRequest): Promise<GetBoardResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const [board] = await db
      .update(boards)
      .set({
        name: request.name,
        canRiderAdd: request.canRiderAdd,
      })
      .where(
        and(
          eq(boards.id, request.boardId),
          eq(boards.organizationId, organizationId)
        )
      )
      .returning();

    // 1. Get existing trainer and service assignments
    const { assignments: existingTrainerAssignments } =
      await boardsApi.listBoardAssignments({
        boardId: request.boardId,
        type: "trainer",
      });

    const { assignments: existingServiceAssignments } =
      await boardsApi.listBoardServiceAssignments({
        boardId: request.boardId,
      });

    // 2. Add/remove trainer assignments
    if (request.trainerIds !== undefined) {
      const trainerIdsToAdd = request.trainerIds.filter(
        (id) => !existingTrainerAssignments.some((a) => a.trainerId === id)
      );
      const trainerAssignmentsToRemove = existingTrainerAssignments.filter(
        (a) => a.trainerId && !request.trainerIds!.includes(a.trainerId)
      );

      for (const trainerId of trainerIdsToAdd) {
        await boardsApi.assignToBoard({
          boardId: board.id,
          trainerId,
        });
      }
      for (const assignment of trainerAssignmentsToRemove) {
        await boardsApi.removeFromBoard({ assignmentId: assignment.id });
      }
    }

    // 3. Add/remove service assignments
    if (request.serviceIds !== undefined) {
      const serviceIdsToAdd = request.serviceIds.filter(
        (id) => !existingServiceAssignments.some((a) => a.serviceId === id)
      );
      const serviceAssignmentsToRemove = existingServiceAssignments.filter(
        (a) => !request.serviceIds!.includes(a.serviceId)
      );

      for (const serviceId of serviceIdsToAdd) {
        await boardsApi.assignToService({
          type: "board",
          serviceId,
          boardId: board.id,
        });
      }
      for (const assignment of serviceAssignmentsToRemove) {
        await boardsApi.unassignFromService({
          type: "board",
          assignmentId: assignment.id,
        });
      }
    }

    return { board };
  }
);

export const deleteBoard = api(
  {
    method: "DELETE",
    path: "/boards/:boardId",
    expose: true,
    auth: true,
  },
  async ({ boardId }: { boardId: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();

    await db
      .delete(boards)
      .where(
        and(eq(boards.id, boardId), eq(boards.organizationId, organizationId))
      );
  }
);
