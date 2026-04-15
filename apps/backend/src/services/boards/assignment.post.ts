import { and, eq } from "drizzle-orm";
import { api } from "encore.dev/api";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import { boardAssignments } from "./schema";
import { GetBoardAssignmentResponse } from "./types/contracts";

interface AssignToBoardRequest {
  boardId: string;
  trainerId?: string;
  riderId?: string;
}

export const assignToBoard = api(
  {
    method: "POST",
    path: "/boards/assignments",
    expose: true,
    auth: true,
  },
  async (
    request: AssignToBoardRequest
  ): Promise<GetBoardAssignmentResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const [assignment] = await db
      .insert(boardAssignments)
      .values({
        organizationId,
        boardId: request.boardId,
        ...(request.trainerId ? { trainerId: request.trainerId } : {}),
        ...(request.riderId ? { riderId: request.riderId } : {}),
      })
      .returning();

    return { assignment };
  }
);

export const removeFromBoard = api(
  {
    method: "DELETE",
    path: "/boards/assignments/:assignmentId",
    expose: true,
    auth: true,
  },
  async ({ assignmentId }: { assignmentId: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();

    await db
      .delete(boardAssignments)
      .where(
        and(
          eq(boardAssignments.id, assignmentId),
          eq(boardAssignments.organizationId, organizationId)
        )
      );
  }
);
