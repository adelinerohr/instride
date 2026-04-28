import type {
  CreateBoardRequest,
  GetBoardResponse,
  UpdateBoardRequest,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { boardService, createBoardService } from "./board.service";
import { db } from "./db";
import { toBoard } from "./mappers";
import { createServiceService } from "./services/service.service";

export const createBoard = api(
  { method: "POST", path: "/boards", expose: true, auth: true },
  async (request: CreateBoardRequest): Promise<GetBoardResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const boardId = await db.transaction(async (tx) => {
      const txBoardService = createBoardService(tx);
      const txServiceService = createServiceService(tx);

      const board = await txBoardService.create({
        name: request.name,
        canRiderAdd: request.canRiderAdd ?? false,
        organizationId,
      });

      if (request.trainerIds?.length) {
        await txBoardService.bulkCreateAssignments(
          request.trainerIds.map((trainerId) => ({
            boardId: board.id,
            organizationId,
            trainerId,
          }))
        );
      }

      if (request.riderIds?.length) {
        await txBoardService.bulkCreateAssignments(
          request.riderIds.map((riderId) => ({
            boardId: board.id,
            organizationId,
            riderId,
          }))
        );
      }

      if (request.serviceIds?.length) {
        await txServiceService.bulkCreateBoardAssignments(
          request.serviceIds.map((serviceId) => ({
            boardId: board.id,
            serviceId,
            organizationId,
          }))
        );
      }

      return board.id;
    });

    const board = await boardService.findOne(boardId, organizationId);
    return { board: toBoard(board) };
  }
);

export const updateBoard = api(
  { method: "PUT", path: "/boards/:boardId", expose: true, auth: true },
  async (request: UpdateBoardRequest): Promise<GetBoardResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { boardId, trainerIds, riderIds, serviceIds, ...scalars } = request;

    await db.transaction(async (tx) => {
      const txBoardService = createBoardService(tx);
      const txServiceService = createServiceService(tx);

      if (Object.keys(scalars).length > 0) {
        await txBoardService.update(boardId, organizationId, scalars);
      }

      // Delete-then-insert for trainer assignments if provided
      if (trainerIds !== undefined) {
        await txBoardService.deleteAssignmentByBoard(
          boardId,
          organizationId,
          "trainer"
        );
        if (trainerIds.length > 0) {
          await txBoardService.bulkCreateAssignments(
            trainerIds.map((trainerId) => ({
              boardId,
              organizationId,
              trainerId,
            }))
          );
        }
      }

      if (riderIds !== undefined) {
        await txBoardService.deleteAssignmentByBoard(
          boardId,
          organizationId,
          "rider"
        );
        if (riderIds.length > 0) {
          await txBoardService.bulkCreateAssignments(
            riderIds.map((riderId) => ({
              boardId,
              organizationId,
              riderId,
            }))
          );
        }
      }

      if (serviceIds !== undefined) {
        await txServiceService.deleteBoardAssignmentsForBoard(
          organizationId,
          boardId
        );
        if (serviceIds.length > 0) {
          await txServiceService.bulkCreateBoardAssignments(
            serviceIds.map((serviceId) => ({
              boardId,
              organizationId,
              serviceId,
            }))
          );
        }
      }
    });

    const board = await boardService.findOne(boardId, organizationId);
    return { board: toBoard(board) };
  }
);

export const deleteBoard = api(
  { method: "DELETE", path: "/boards/:boardId", expose: true, auth: true },
  async ({ boardId }: { boardId: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    await boardService.delete(boardId, organizationId);
  }
);
