import { LessonSeriesEnrollmentStatus } from "@instride/shared/models/enums";
import { eq } from "drizzle-orm";
import { api } from "encore.dev/api";

import { db } from "@/database";

import { enrollInInstance } from "../enrollments/post";
import { lessonSeries } from "../schema";
import { getLessonSeries } from "../series/get";
import {
  generateRecurringInstances,
  generateStandaloneInstance,
} from "./utils";

interface GenerateLessonInstancesRequest {
  seriesId: string;
  until: Date;
}

export interface SkippedInstance {
  date: string;
  reason: string;
  eventTitle?: string;
}

export interface GenerateLessonInstancesResponse {
  created: number;
  skipped: SkippedInstance[];
}

export const generateLessonInstances = api(
  {
    method: "POST",
    path: "/lessons/scheduler/generate",
    auth: true,
  },
  async (
    request: GenerateLessonInstancesRequest
  ): Promise<GenerateLessonInstancesResponse> => {
    const series = await getLessonSeries({ id: request.seriesId });

    const { instances, skipped } = series.isRecurring
      ? await generateRecurringInstances({
          series,
          timezone: series.timezone,
          until: request.until,
        })
      : await generateStandaloneInstance({
          series,
          timezone: series.timezone,
        });

    const activeEnrollments = await db.query.lessonSeriesEnrollments.findMany({
      where: {
        seriesId: series.id,
        status: LessonSeriesEnrollmentStatus.ACTIVE,
      },
    });

    for (const instance of instances) {
      if (activeEnrollments.length > 0) {
        await enrollInInstance({
          instanceId: instance.id,
          riderIds: activeEnrollments.map((e) => e.riderId),
        });
      }
    }

    await db
      .update(lessonSeries)
      .set({ lastPlannedUntil: request.until })
      .where(eq(lessonSeries.id, series.id));

    return { created: instances.length, skipped };
  }
);
