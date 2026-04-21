import { api } from "encore.dev/api";
import { guardians, organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";
import { riderRelationQuery } from "@/shared/utils/relation-queries";
import { assertExists } from "@/shared/utils/validation";

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

/**
 * List the enrollments for the current user.
 * Include the enrollments for the current user's dependents, if any.
 */
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

    assertExists(member.rider, "Rider not found");

    const { relationships } = await guardians.getMyDependents();
    const dependentRiderIds = relationships.map(
      (relationship) => relationship.dependent.riderId
    );

    const instanceEnrollments =
      await db.query.lessonInstanceEnrollments.findMany({
        where: {
          riderId: {
            in: [member.rider.id, ...dependentRiderIds],
          },
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
      });

    const seriesEnrollments = await db.query.lessonSeriesEnrollments.findMany({
      where: {
        riderId: {
          in: [member.rider.id, ...dependentRiderIds],
        },
        organizationId,
      },
    });

    return { instanceEnrollments, seriesEnrollments };
  }
);
