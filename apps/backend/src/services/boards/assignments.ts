import type {
  AssignToBoardRequest,
  GetBoardAssignmentResponse,
  ListBoardAssignmentsRequest,
  ListBoardAssignmentsResponse,
} from "@instride/api/contracts";
import { api, APIError } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { boardService } from "./board.service";
import { toBoardAssignment } from "./mappers";

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
    const { organizationId } = requireOrganizationAuth();

    const assignments = await boardService.findManyAssignments(
      organizationId,
      request.role
    );

    return { assignments: assignments.map(toBoardAssignment) };
  }
);

export const assignToBoard = api(
  { method: "POST", path: "/boards/assignments", expose: true, auth: true },
  async (
    request: AssignToBoardRequest
  ): Promise<GetBoardAssignmentResponse> => {
    const { organizationId } = requireOrganizationAuth();

    if (!request.trainerId && !request.riderId) {
      throw APIError.invalidArgument(
        "Either trainerId or riderId must be provided"
      );
    }
    if (request.trainerId && request.riderId) {
      throw APIError.invalidArgument(
        "Cannot assign both trainer and rider on a single assignment"
      );
    }

    const created = await boardService.createAssignment({
      organizationId,
      boardId: request.boardId,
      trainerId: request.trainerId ?? null,
      riderId: request.riderId ?? null,
    });

    const assignment = await boardService.findOneAssignment(
      created.id,
      organizationId
    );
    assertExists(assignment, "Failed to load assignment after create");

    return { assignment: toBoardAssignment(assignment) };
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

    await boardService.deleteAssignment(assignmentId, organizationId);
  }
);
