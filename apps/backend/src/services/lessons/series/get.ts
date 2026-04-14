import { api, APIError } from "encore.dev/api";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";
import { riderRelationQuery } from "@/shared/utils/relation-queries";

import {
  GetLessonSeriesResponse,
  ListLessonSeriesResponse,
} from "../types/contracts";

export const listLessonSeries = api(
  {
    expose: true,
    method: "GET",
    path: "/lessons/series",
    auth: true,
  },
  async (): Promise<ListLessonSeriesResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const series = await db.query.lessonSeries.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        start: "asc",
      },
    });

    return { series };
  }
);

export const getLessonSeries = api(
  {
    expose: true,
    method: "GET",
    path: "/lessons/series/:id",
    auth: true,
  },
  async ({ id }: { id: string }): Promise<GetLessonSeriesResponse> => {
    const series = await db.query.lessonSeries.findFirst({
      where: {
        id,
      },
      with: {
        enrollments: {
          with: riderRelationQuery,
        },
      },
    });

    if (!series) throw APIError.notFound("Lesson series not found");

    return { series };
  }
);
