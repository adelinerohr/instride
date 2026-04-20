import { api, APIError } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { db } from "../db";
import { GetServiceResponse, ListServicesResponse } from "../types/contracts";

interface ListServicesRequest {
  trainerId?: string;
  boardId?: string;
}

export const listServices = api(
  {
    method: "GET",
    path: "/services",
    expose: true,
    auth: true,
  },
  async (request: ListServicesRequest): Promise<ListServicesResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const boardCondition = request.boardId
      ? {
          boardAssignments: {
            boardId: request.boardId,
          },
        }
      : {};

    const trainerCondition = request.trainerId
      ? {
          trainerAssignments: {
            trainerId: request.trainerId,
          },
        }
      : {};

    const services = await db.query.services.findMany({
      where: {
        organizationId,
        ...boardCondition,
        ...trainerCondition,
      },
      with: {
        boardAssignments: {
          with: {
            board: true,
          },
        },
        restrictedToLevel: true,
        trainerAssignments: {
          with: {
            trainer: {
              with: {
                member: {
                  with: {
                    authUser: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return { services };
  }
);

export const getService = api(
  {
    method: "GET",
    path: "/services/:id",
    expose: true,
    auth: true,
  },
  async ({ id }: { id: string }): Promise<GetServiceResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const service = await db.query.services.findFirst({
      where: {
        id,
        organizationId,
      },
      with: {
        boardAssignments: {
          with: {
            board: true,
          },
        },
        trainerAssignments: true,
      },
    });

    if (!service) {
      throw APIError.notFound("Service not found");
    }
    return { service };
  }
);
