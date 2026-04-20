import { and, eq } from "drizzle-orm";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { db } from "../db";
import { services } from "../schema";
import { GetServiceResponse } from "../types/contracts";
import {
  listBoardServiceAssignments,
  listTrainerServiceAssignments,
} from "./assignments.get";
import { assignToService, unassignFromService } from "./assignments.post";

interface CreateServiceRequest {
  name: string;
  duration: number;
  price: number;
  creditPrice: number;
  maxRiders: number;
  isRestricted?: boolean;
  description?: string | null;
  canRiderAdd?: boolean;
  creditAdditionalPrice?: number | null;
  isPrivate?: boolean;
  canRecurBook?: boolean;
  restrictedToLevelId?: string | null;
  isAllTrainers?: boolean;
  isActive?: boolean;
  boardIds?: string[];
  trainerIds?: string[];
}

export const createService = api(
  {
    method: "POST",
    path: "/services",
    expose: true,
    auth: true,
  },
  async (request: CreateServiceRequest): Promise<GetServiceResponse> => {
    const { organizationId } = requireOrganizationAuth();

    // 1. Create the service
    const [service] = await db
      .insert(services)
      .values({
        ...request,
        organizationId,
      })
      .returning();

    // 2. Assign the boards to the service
    if (request.boardIds) {
      for (const boardId of request.boardIds) {
        await assignToService({
          type: "board",
          serviceId: service.id,
          boardId,
        });
      }
    }

    // 3. Assign the trainers to the service
    if (request.trainerIds) {
      for (const trainerId of request.trainerIds) {
        await assignToService({
          type: "trainer",
          serviceId: service.id,
          trainerId,
        });
      }
    }

    return { service };
  }
);

interface UpdateServiceRequest extends Partial<CreateServiceRequest> {
  id: string;
}

export const updateService = api(
  {
    method: "PUT",
    path: "/services/:id",
    expose: true,
    auth: true,
  },
  async (request: UpdateServiceRequest): Promise<GetServiceResponse> => {
    const { organizationId } = requireOrganizationAuth();

    // 1. Update the service
    const [service] = await db
      .update(services)
      .set(request)
      .where(
        and(
          eq(services.id, request.id),
          eq(services.organizationId, organizationId)
        )
      )
      .returning();

    const { assignments: currentBoardAssignments } =
      await listBoardServiceAssignments({
        serviceId: service.id,
      });

    const { assignments: currentTrainerAssignments } =
      await listTrainerServiceAssignments({
        serviceId: service.id,
      });

    const newBoardIds = request.boardIds ?? [];
    const newTrainerIds = request.trainerIds ?? [];

    const boardIdsToAssign = newBoardIds.filter(
      (id) => !currentBoardAssignments.some((b) => b.boardId === id)
    );
    const trainerIdsToAssign = newTrainerIds.filter(
      (id) => !currentTrainerAssignments.some((t) => t.trainerId === id)
    );

    const boardsToUnassign = currentBoardAssignments.filter(
      (b) => !newBoardIds.includes(b.boardId)
    );
    const trainersToUnassign = currentTrainerAssignments.filter(
      (t) => !newTrainerIds.includes(t.trainerId)
    );

    // 2. Assign the boards to the service
    if (request.boardIds) {
      for (const boardId of boardIdsToAssign) {
        await assignToService({
          type: "board",
          serviceId: service.id,
          boardId,
        });
      }
      for (const board of boardsToUnassign) {
        await unassignFromService({
          type: "board",
          assignmentId: board.id,
        });
      }
    }

    // 3. Assign the trainers to the service
    if (request.trainerIds) {
      for (const trainerId of trainerIdsToAssign) {
        await assignToService({
          type: "trainer",
          serviceId: service.id,
          trainerId,
        });
      }
      for (const trainer of trainersToUnassign) {
        await unassignFromService({
          type: "trainer",
          assignmentId: trainer.id,
        });
      }
    }

    return { service };
  }
);

export const deleteService = api(
  {
    method: "DELETE",
    path: "/services/:id",
    expose: true,
    auth: true,
  },
  async ({ id }: { id: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();

    await db
      .delete(services)
      .where(
        and(eq(services.id, id), eq(services.organizationId, organizationId))
      );
  }
);
