import { api, APIError } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";
import { riderRelationQuery } from "@/shared/utils/relation-queries";

import { db } from "../db";
import {
  ListLessonInstanceEnrollmentsResponse,
  ListLessonSeriesEnrollmentsResponse,
} from "../types/contracts";
import {
  LessonInstanceEnrollment,
  LessonSeriesEnrollment,
} from "../types/models";

export const listSeriesEnrollments = api(
  {
    expose: true,
    method: "GET",
    path: "/lessons/series/:id/enrollments",
    auth: true,
  },
  async ({
    id,
  }: {
    id: string;
  }): Promise<ListLessonSeriesEnrollmentsResponse> => {
    const enrollments = await db.query.lessonSeriesEnrollments.findMany({
      where: {
        seriesId: id,
      },
      with: {
        instanceEnrollments: {
          with: riderRelationQuery,
        },
      },
    });

    return { enrollments };
  }
);

export const listInstanceEnrollments = api(
  {
    expose: true,
    method: "GET",
    path: "/lessons/instances/:id/enrollments",
    auth: true,
  },
  async ({
    id,
  }: {
    id: string;
  }): Promise<ListLessonInstanceEnrollmentsResponse> => {
    const enrollments = await db.query.lessonInstanceEnrollments.findMany({
      where: {
        instanceId: id,
      },
      with: riderRelationQuery,
    });

    return { enrollments };
  }
);

interface ListMyEnrollmentsResponse {
  instanceEnrollments: LessonInstanceEnrollment[];
  seriesEnrollments: LessonSeriesEnrollment[];
}

export const listMyEnrollments = api(
  {
    expose: true,
    method: "GET",
    path: "/lessons/series/enrollments/me",
    auth: true,
  },
  async (): Promise<ListMyEnrollmentsResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const { member } = await organizations.getMember();

    if (!member.rider) {
      throw APIError.notFound("Rider not found");
    }

    const instanceEnrollments =
      await db.query.lessonInstanceEnrollments.findMany({
        where: {
          riderId: member.rider.id,
          organizationId,
        },
        with: {
          instance: {
            with: {
              series: true,
              service: true,
              board: true,
              trainer: {
                with: {
                  member: {
                    with: {
                      authUser: true,
                    },
                  },
                },
              },
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
            },
          },
        },
      });

    const seriesEnrollments = await db.query.lessonSeriesEnrollments.findMany({
      where: {
        riderId: member.rider.id,
        organizationId,
      },
    });

    return { instanceEnrollments, seriesEnrollments };
  }
);
