import { and, eq, gte } from "drizzle-orm";

import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { lessonSeriesExpansion } from "../fragments";
import {
  lessonInstances,
  lessonSeries,
  type LessonSeriesRow,
  type NewLessonSeriesRow,
} from "../schema";

export const createLessonSeriesService = (
  client: Database | Transaction = db
) => ({
  create: async (data: NewLessonSeriesRow) => {
    const [series] = await client.insert(lessonSeries).values(data).returning();
    assertExists(series, "Failed to create lesson series");
    return series;
  },

  findOneFull: async (id: string, organizationId: string) => {
    const series = await client.query.lessonSeries.findFirst({
      where: { id, organizationId },
      with: lessonSeriesExpansion,
    });
    assertExists(series, "Lesson series not found");
    return series;
  },

  findOneScalar: async (id: string, organizationId: string) => {
    const series = await client.query.lessonSeries.findFirst({
      where: { id, organizationId },
    });
    assertExists(series, "Lesson series not found");
    return series;
  },

  findManyFull: async (organizationId: string) => {
    return await client.query.lessonSeries.findMany({
      where: { organizationId },
      orderBy: { start: "asc" },
      with: lessonSeriesExpansion,
    });
  },

  update: async (
    id: string,
    organizationId: string,
    data: Partial<LessonSeriesRow>
  ) => {
    const [series] = await client
      .update(lessonSeries)
      .set(data)
      .where(
        and(
          eq(lessonSeries.id, id),
          eq(lessonSeries.organizationId, organizationId)
        )
      )
      .returning();
    assertExists(series, "Lesson series not found");
    return series;
  },

  cancel: async (params: {
    id: string;
    organizationId: string;
    canceledByMemberId: string;
    reason: string | null;
  }) => {
    const now = new Date();

    await client
      .update(lessonSeries)
      .set({
        status: "cancelled",
        updatedByMemberId: params.canceledByMemberId,
      })
      .where(
        and(
          eq(lessonSeries.id, params.id),
          eq(lessonSeries.organizationId, params.organizationId)
        )
      );

    // Cancel all future instances; leave past instances intact for attendance records
    await client
      .update(lessonInstances)
      .set({
        status: "cancelled",
        canceledAt: now,
        canceledByMemberId: params.canceledByMemberId,
        cancelReason: params.reason,
      })
      .where(
        and(
          eq(lessonInstances.seriesId, params.id),
          eq(lessonInstances.organizationId, params.organizationId),
          gte(lessonInstances.start, now)
        )
      );
  },
});

export const lessonSeriesService = createLessonSeriesService();
