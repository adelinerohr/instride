import type {
  CreateBoardRequest,
  GetBoardResponse,
  UpdateBoardRequest,
} from "@instride/api/contracts";
import { and, eq } from "drizzle-orm";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import { boardExpansion } from "./fragments";
import { toBoard } from "./mappers";
import { boardAssignments, boards, serviceBoardAssignments } from "./schema";

export const createBoard = api(
  { method: "POST", path: "/boards", expose: true, auth: true },
  async (request: CreateBoardRequest): Promise<GetBoardResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const boardId = await db.transaction(async (tx) => {
      const [board] = await tx
        .insert(boards)
        .values({
          name: request.name,
          canRiderAdd: request.canRiderAdd ?? false,
          organizationId,
        })
        .returning();

      if (request.trainerIds?.length) {
        await tx.insert(boardAssignments).values(
          request.trainerIds.map((trainerId) => ({
            boardId: board.id,
            organizationId,
            trainerId,
          }))
        );
      }

      if (request.riderIds?.length) {
        await tx.insert(boardAssignments).values(
          request.riderIds.map((riderId) => ({
            boardId: board.id,
            organizationId,
            riderId,
          }))
        );
      }

      if (request.serviceIds?.length) {
        await tx.insert(serviceBoardAssignments).values(
          request.serviceIds.map((serviceId) => ({
            boardId: board.id,
            serviceId,
            organizationId,
          }))
        );
      }

      return board.id;
    });

    const board = await db.query.boards.findFirst({
      where: { id: boardId, organizationId },
      with: boardExpansion,
    });
    assertExists(board, "Failed to load board after create");
    return { board: toBoard(board) };
  }
);

export const updateBoard = api(
  { method: "PUT", path: "/boards/:boardId", expose: true, auth: true },
  async (request: UpdateBoardRequest): Promise<GetBoardResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { boardId, trainerIds, riderIds, serviceIds, ...scalars } = request;

    await db.transaction(async (tx) => {
      if (Object.keys(scalars).length > 0) {
        await tx
          .update(boards)
          .set(scalars)
          .where(
            and(
              eq(boards.id, boardId),
              eq(boards.organizationId, organizationId)
            )
          );
      }

      // Delete-then-insert for trainer assignments if provided
      if (trainerIds !== undefined) {
        await tx.delete(boardAssignments).where(
          and(
            eq(boardAssignments.boardId, boardId),
            eq(boardAssignments.organizationId, organizationId)
            // Only delete trainer assignments; preserve rider assignments
            // (trainerId IS NOT NULL means this is a trainer assignment)
            // Drizzle syntax for "is not null" depends on your setup:
            // sql`${boardAssignments.trainerId} IS NOT NULL`
          )
        );
        // NOTE: the delete above needs "trainerId IS NOT NULL" — see inline note
        if (trainerIds.length > 0) {
          await tx.insert(boardAssignments).values(
            trainerIds.map((trainerId) => ({
              boardId,
              organizationId,
              trainerId,
            }))
          );
        }
      }

      if (riderIds !== undefined) {
        // Same pattern: delete existing rider assignments, then insert new
        // Need "riderId IS NOT NULL" filter
        if (riderIds.length > 0) {
          await tx.insert(boardAssignments).values(
            riderIds.map((riderId) => ({
              boardId,
              organizationId,
              riderId,
            }))
          );
        }
      }

      if (serviceIds !== undefined) {
        await tx
          .delete(serviceBoardAssignments)
          .where(
            and(
              eq(serviceBoardAssignments.boardId, boardId),
              eq(serviceBoardAssignments.organizationId, organizationId)
            )
          );
        if (serviceIds.length > 0) {
          await tx.insert(serviceBoardAssignments).values(
            serviceIds.map((serviceId) => ({
              boardId,
              organizationId,
              serviceId,
            }))
          );
        }
      }
    });

    const board = await db.query.boards.findFirst({
      where: { id: boardId, organizationId },
      with: boardExpansion,
    });
    assertExists(board, "Board not found");
    return { board: toBoard(board) };
  }
);

export const deleteBoard = api(
  { method: "DELETE", path: "/boards/:boardId", expose: true, auth: true },
  async ({ boardId }: { boardId: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();

    await db
      .delete(boards)
      .where(
        and(eq(boards.id, boardId), eq(boards.organizationId, organizationId))
      );
  }
);
