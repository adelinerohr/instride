import { LessonSeriesEnrollmentStatus } from "@instride/shared/models/enums";
import { eq } from "drizzle-orm";

import { db } from "../db";
import { enrollRidersInInstance } from "../enrollments/mutations";
import { lessonSeries, LessonInstanceRow, LessonSeriesRow } from "../schema";
import {
  generateRecurringInstances,
  generateStandaloneInstance,
} from "./utils";

export interface SkippedInstance {
  date: string;
  reason: string;
  eventTitle?: string;
}

export interface GenerateLessonInstancesResult {
  created: number;
  skipped: SkippedInstance[];
}

interface GenerateInstancesForSeriesInput {
  seriesId: string;
  until: Date;
  /**
   * Member id to record as creator on newly-materialized instances.
   * `null` for system callers (cron roll-forward). User-initiated series
   * creation passes the creating member's id.
   */
  createdByMemberId: string | null;
}

/**
 * Plain function used by both the HTTP endpoint and the cron. Takes all
 * context explicitly (no auth lookup) so it is safe to call from the cron,
 * which has no request session.
 *
 * The loaded series row is trusted for `organizationId`; callers are
 * responsible for any permission checks before invoking.
 */
export async function generateInstancesForSeries(
  input: GenerateInstancesForSeriesInput
): Promise<GenerateLessonInstancesResult> {
  const series = await db.query.lessonSeries.findFirst({
    where: { id: input.seriesId },
    with: {
      organization: { columns: { timezone: true } },
    },
  });

  if (!series) {
    throw new Error(`Lesson series not found: ${input.seriesId}`);
  }

  const timezone = series.organization?.timezone;
  if (!timezone) {
    throw new Error(
      `Lesson series organization timezone not found: ${input.seriesId}`
    );
  }

  // Strip the organization relation so the shape matches LessonSeries.
  if (series.isRecurring) {
    const generation = await generateRecurringInstances({
      series,
      timezone,
      until: input.until,
      createdByMemberId: input.createdByMemberId,
    });

    await enrollActiveRiders({
      series,
      instances: generation.instances,
      enrolledByMemberId: input.createdByMemberId,
    });

    // Record what we ACTUALLY planned through, clamped to recurrenceEnd.
    // Only meaningful for recurring series.
    await db
      .update(lessonSeries)
      .set({ lastPlannedUntil: generation.plannedUntil })
      .where(eq(lessonSeries.id, series.id));

    return {
      created: generation.instances.length,
      skipped: generation.skipped,
    };
  }

  const generation = await generateStandaloneInstance({
    series,
    timezone,
    createdByMemberId: input.createdByMemberId,
  });

  await enrollActiveRiders({
    series,
    instances: generation.instances,
    enrolledByMemberId: input.createdByMemberId,
  });

  return {
    created: generation.instances.length,
    skipped: generation.skipped,
  };
}

/**
 * Enroll the series' active enrollees into each newly-created instance.
 * `enrollRidersInInstance` is idempotent, so this is safe to re-run.
 */
async function enrollActiveRiders(input: {
  series: LessonSeriesRow;
  instances: LessonInstanceRow[];
  enrolledByMemberId: string | null;
}): Promise<void> {
  if (input.instances.length === 0) return;

  const activeEnrollments = await db.query.lessonSeriesEnrollments.findMany({
    where: {
      seriesId: input.series.id,
      status: LessonSeriesEnrollmentStatus.ACTIVE,
    },
  });

  if (activeEnrollments.length === 0) return;

  const riderIds = activeEnrollments.map((e) => e.riderId);
  for (const instance of input.instances) {
    await enrollRidersInInstance({
      organizationId: input.series.organizationId,
      instanceId: instance.id,
      riderIds,
      enrolledByMemberId: input.enrolledByMemberId,
      idempotent: true,
    });
  }
}
