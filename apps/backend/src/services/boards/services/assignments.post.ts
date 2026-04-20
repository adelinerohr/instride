import { and, eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { db } from "../db";
import { serviceBoardAssignments, serviceTrainerAssignments } from "../schema";
import {
  ServiceBoardAssignment,
  ServiceTrainerAssignment,
} from "../types/models";

interface AssignToServiceRequest {
  type: "trainer" | "board";
  serviceId: string;
  trainerId?: string;
  boardId?: string;
  isActive?: boolean;
}

interface AssignToServiceResponse {
  assignment: ServiceTrainerAssignment | ServiceBoardAssignment;
}

export const assignToService = api(
  {
    method: "POST",
    path: "/services/assignments",
    expose: true,
    auth: true,
  },
  async (request: AssignToServiceRequest): Promise<AssignToServiceResponse> => {
    const { organizationId } = requireOrganizationAuth();

    if (request.type === "trainer" && request.trainerId) {
      const [assignment] = await db
        .insert(serviceTrainerAssignments)
        .values({
          serviceId: request.serviceId,
          trainerId: request.trainerId,
          organizationId,
        })
        .returning();
      return { assignment };
    } else if (request.type === "board" && request.boardId) {
      const [assignment] = await db
        .insert(serviceBoardAssignments)
        .values({
          serviceId: request.serviceId,
          boardId: request.boardId,
          organizationId,
        })
        .returning();
      return { assignment };
    }

    throw APIError.invalidArgument("Invalid assignment type");
  }
);

interface UnassignFromServiceRequest {
  type: "trainer" | "board";
  assignmentId: string;
}

export const unassignFromService = api(
  {
    method: "DELETE",
    path: "/services/assignments/:assignmentId",
    expose: true,
    auth: true,
  },
  async (request: UnassignFromServiceRequest): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();

    if (request.type === "trainer") {
      await db
        .delete(serviceTrainerAssignments)
        .where(
          and(
            eq(serviceTrainerAssignments.id, request.assignmentId),
            eq(serviceTrainerAssignments.organizationId, organizationId)
          )
        );
    } else if (request.type === "board") {
      await db
        .delete(serviceBoardAssignments)
        .where(
          and(
            eq(serviceBoardAssignments.id, request.assignmentId),
            eq(serviceBoardAssignments.organizationId, organizationId)
          )
        );
    }
  }
);
