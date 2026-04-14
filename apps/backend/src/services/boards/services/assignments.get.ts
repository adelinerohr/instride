import { api, APIError } from "encore.dev/api";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import {
  GetTrainerServiceAssignmentResponse,
  ListBoardServiceAssignmentsResponse,
  ListTrainerServiceAssignmentsResponse,
} from "../types/contracts";

interface ListTrainerServiceAssignmentsRequest {
  trainerId?: string;
  serviceId?: string;
}

export const listTrainerServiceAssignments = api(
  {
    method: "GET",
    path: "/services/assignments/trainer",
    expose: true,
    auth: true,
  },
  async (
    request: ListTrainerServiceAssignmentsRequest
  ): Promise<ListTrainerServiceAssignmentsResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const assignments = await db.query.serviceTrainerAssignments.findMany({
      where: {
        organizationId,
        ...(request.trainerId ? { trainerId: request.trainerId } : {}),
        ...(request.serviceId ? { serviceId: request.serviceId } : {}),
      },
      with: {
        service: true,
      },
    });

    return { assignments };
  }
);

interface ListBoardServiceAssignmentsRequest {
  boardId?: string;
  serviceId?: string;
}

export const listBoardServiceAssignments = api(
  {
    method: "GET",
    path: "/services/assignments/board",
    expose: true,
    auth: true,
  },
  async (
    request: ListBoardServiceAssignmentsRequest
  ): Promise<ListBoardServiceAssignmentsResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const assignments = await db.query.serviceBoardAssignments.findMany({
      where: {
        organizationId,
        ...(request.boardId ? { boardId: request.boardId } : {}),
        ...(request.serviceId ? { serviceId: request.serviceId } : {}),
      },
      with: {
        service: true,
      },
    });

    return { assignments };
  }
);

export const getTrainerServiceAssignment = api(
  {
    method: "GET",
    path: "/services/assignments/trainer/:assignmentId",
    expose: true,
    auth: true,
  },
  async ({
    assignmentId,
  }: {
    assignmentId: string;
  }): Promise<GetTrainerServiceAssignmentResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const assignment = await db.query.serviceTrainerAssignments.findFirst({
      where: {
        organizationId,
        id: assignmentId,
      },
      with: {
        service: true,
      },
    });

    if (!assignment) {
      throw APIError.notFound("Assignment not found");
    }
    return { assignment };
  }
);
