import type {
  AssignBoardToServiceRequest,
  AssignTrainerToServiceRequest,
  CreateServiceRequest,
  GetServiceBoardAssignmentResponse,
  GetServiceResponse,
  GetServiceTrainerAssignmentResponse,
  UpdateServiceRequest,
} from "@instride/api/contracts";
import { and, eq } from "drizzle-orm";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { services } from "../schema";
import { createServiceService, serviceService } from "./service.service";

export const createService = api(
  { method: "POST", path: "/services", expose: true, auth: true },
  async (request: CreateServiceRequest): Promise<GetServiceResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { boardIds, trainerIds, ...data } = request;

    const serviceId = await db.transaction(async (tx) => {
      const serviceTx = createServiceService(tx);
      const service = await serviceTx.create({ ...data, organizationId });

      if (boardIds?.length) {
        await serviceTx.bulkCreateBoardAssignments(
          boardIds.map((boardId) => ({
            serviceId: service.id,
            boardId,
            organizationId,
          }))
        );
      }

      if (trainerIds?.length) {
        await serviceTx.bulkCreateTrainerAssignments(
          trainerIds.map((trainerId) => ({
            serviceId: service.id,
            trainerId,
            organizationId,
          }))
        );
      }

      return service.id;
    });

    const service = await serviceService.findOne(serviceId, organizationId);
    return { service };
  }
);

export const updateService = api(
  { method: "PUT", path: "/services/:id", expose: true, auth: true },
  async (request: UpdateServiceRequest): Promise<GetServiceResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { id, boardIds, trainerIds, ...scalars } = request;

    await db.transaction(async (tx) => {
      const serviceTx = createServiceService(tx);
      if (Object.keys(scalars).length > 0) {
        await serviceTx.update(id, organizationId, scalars);
      }

      if (boardIds !== undefined) {
        await serviceTx.deleteBoardAssignment(id, organizationId);
        if (boardIds.length > 0) {
          await serviceTx.bulkCreateBoardAssignments(
            boardIds.map((boardId) => ({
              serviceId: id,
              boardId,
              organizationId,
            }))
          );
        }
      }

      if (trainerIds !== undefined) {
        await serviceTx.deleteTrainerAssignment(id, organizationId);
        if (trainerIds.length > 0) {
          await serviceTx.bulkCreateTrainerAssignments(
            trainerIds.map((trainerId) => ({
              serviceId: id,
              trainerId,
              organizationId,
            }))
          );
        }
      }
    });

    const service = await serviceService.findOne(id, organizationId);
    assertExists(service, "Service not found");
    return { service };
  }
);

export const deleteService = api(
  { method: "DELETE", path: "/services/:id", expose: true, auth: true },
  async ({ id }: { id: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();

    await db
      .delete(services)
      .where(
        and(eq(services.id, id), eq(services.organizationId, organizationId))
      );
  }
);

export const assignTrainerToService = api(
  {
    method: "POST",
    path: "/services/assignments/trainer",
    expose: true,
    auth: true,
  },
  async (
    request: AssignTrainerToServiceRequest
  ): Promise<GetServiceTrainerAssignmentResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const assignment = await serviceService.createTrainerAssignment({
      serviceId: request.serviceId,
      trainerId: request.trainerId,
      organizationId,
    });

    return { assignment };
  }
);

export const assignBoardToService = api(
  {
    method: "POST",
    path: "/services/assignments/board",
    expose: true,
    auth: true,
  },
  async (
    request: AssignBoardToServiceRequest
  ): Promise<GetServiceBoardAssignmentResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const assignment = await serviceService.createBoardAssignment({
      serviceId: request.serviceId,
      boardId: request.boardId,
      organizationId,
    });

    return { assignment };
  }
);

export const unassignTrainerFromService = api(
  {
    method: "DELETE",
    path: "/services/assignments/trainer/:assignmentId",
    expose: true,
    auth: true,
  },
  async ({ assignmentId }: { assignmentId: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    await serviceService.deleteTrainerAssignment(assignmentId, organizationId);
  }
);

export const unassignBoardFromService = api(
  {
    method: "DELETE",
    path: "/services/assignments/board/:assignmentId",
    expose: true,
    auth: true,
  },
  async ({ assignmentId }: { assignmentId: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    await serviceService.deleteBoardAssignment(assignmentId, organizationId);
  }
);
