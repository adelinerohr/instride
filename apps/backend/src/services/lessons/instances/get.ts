import { api, APIError } from "encore.dev/api";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import {
  GetLessonInstanceResponse,
  ListLessonInstancesResponse,
} from "../types/contracts";

interface ListLessonInstancesRequest {
  from: string;
  to: string;
}

export const listLessonInstances = api(
  {
    expose: true,
    method: "GET",
    path: "/lessons/instances",
    auth: true,
  },
  async (
    request: ListLessonInstancesRequest
  ): Promise<ListLessonInstancesResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const instances = await db.query.lessonInstances.findMany({
      where: {
        organizationId,
        start: {
          gte: new Date(request.from),
          lte: new Date(request.to),
        },
      },
      orderBy: {
        start: "asc",
      },
      with: {
        enrollments: {
          with: {
            rider: {
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
        level: true,
        service: true,
        trainer: {
          with: {
            member: {
              with: {
                authUser: true,
              },
            },
          },
        },
        board: true,
        series: true,
      },
    });

    return { instances };
  }
);

export const getLessonInstance = api(
  {
    expose: true,
    method: "GET",
    path: "/lessons/instances/:id",
    auth: true,
  },
  async ({ id }: { id: string }): Promise<GetLessonInstanceResponse> => {
    const instance = await db.query.lessonInstances.findFirst({
      where: { id },
      with: {
        enrollments: {
          with: {
            rider: {
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
        service: true,
        board: true,
        level: true,
        trainer: {
          with: {
            member: {
              with: {
                authUser: true,
              },
            },
          },
        },
        series: true,
      },
    });

    if (!instance) throw APIError.notFound("Lesson instance not found");

    return { instance };
  }
);
