import type {
  GetServiceResponse,
  GetServiceTrainerAssignmentResponse,
  ListServiceBoardAssignmentsRequest,
  ListServiceBoardAssignmentsResponse,
  ListServicesRequest,
  ListServicesResponse,
  ListServiceTrainerAssignmentsRequest,
  ListServiceTrainerAssignmentsResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { serviceService } from "./service.service";

export const listServices = api(
  { method: "GET", path: "/services", expose: true, auth: true },
  async (request: ListServicesRequest): Promise<ListServicesResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const services = await serviceService.findMany(organizationId, {
      boardId: request.boardId,
      trainerId: request.trainerId,
    });

    return { services };
  }
);

export const getService = api(
  { method: "GET", path: "/services/:id", expose: true, auth: true },
  async ({ id }: { id: string }): Promise<GetServiceResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const service = await serviceService.findOne(id, organizationId);
    assertExists(service, "Service not found");
    return { service };
  }
);

export const listServiceTrainerAssignments = api(
  {
    method: "GET",
    path: "/services/assignments/trainer",
    expose: true,
    auth: true,
  },
  async (
    request: ListServiceTrainerAssignmentsRequest
  ): Promise<ListServiceTrainerAssignmentsResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const assignments = await serviceService.findManyTrainerAssignments(
      organizationId,
      {
        trainerId: request.trainerId,
        serviceId: request.serviceId,
      }
    );

    return { assignments };
  }
);

export const listServiceBoardAssignments = api(
  {
    method: "GET",
    path: "/services/assignments/board",
    expose: true,
    auth: true,
  },
  async (
    request: ListServiceBoardAssignmentsRequest
  ): Promise<ListServiceBoardAssignmentsResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const assignments = await serviceService.findManyBoardAssignments(
      organizationId,
      {
        boardId: request.boardId,
        serviceId: request.serviceId,
      }
    );

    return { assignments };
  }
);

export const getServiceTrainerAssignment = api(
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
  }): Promise<GetServiceTrainerAssignmentResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const assignment = await serviceService.findOneTrainerAssignment(
      assignmentId,
      organizationId
    );
    assertExists(assignment, "Trainer assignment not found");
    return { assignment };
  }
);
