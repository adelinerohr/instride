import { LessonSeriesStatus } from "@instride/shared";
import { appMeta } from "encore.dev";
import { api } from "encore.dev/api";
import { CronJob } from "encore.dev/cron";
import log from "encore.dev/log";

import { db } from "../db";
import { generateInstancesForSeries } from "./generate";

/**
 * Generation window in weeks. Prod plans farther out so riders see a fuller
 * calendar; dev keeps the window short to reduce noise during testing.
 */
function getWindowWeeks(): number {
  return appMeta().environment.type === "production" ? 12 : 4;
}

/**
 * Rolls every active recurring series forward so instances always exist
 * for the next N weeks. Standalone series are one-offs and are not touched
 * here (they are materialized at series-creation time).
 *
 * Idempotent: re-running is safe. All creates go through occurrenceKey
 * upsert; all enrollments are reconciled against existing rows.
 */
export const rollForwardLessonInstances = api(
  { expose: false },
  async (): Promise<{
    seriesProcessed: number;
    totalCreated: number;
    totalSkipped: number;
    errors: number;
  }> => {
    const windowWeeks = getWindowWeeks();
    const until = new Date();
    until.setDate(until.getDate() + windowWeeks * 7);

    const now = new Date();

    // Series eligible for roll-forward:
    //   - recurring (standalone = single instance, no rolling needed)
    //   - status ACTIVE (skip cancelled)
    //   - either never planned, or last planned before our new window end
    //   - recurrence hasn't ended (no recurrenceEnd, or it's in the future)
    const seriesToProcess = await db.query.lessonSeries.findMany({
      where: {
        isRecurring: true,
        status: LessonSeriesStatus.ACTIVE,
        OR: [
          { lastPlannedUntil: { isNull: true } },
          { lastPlannedUntil: { lt: until } },
        ],
        AND: [
          {
            OR: [
              { recurrenceEnd: { isNull: true } },
              { recurrenceEnd: { gte: now } },
            ],
          },
        ],
      },
      columns: { id: true, organizationId: true },
    });

    let totalCreated = 0;
    let totalSkipped = 0;
    let errors = 0;

    // Bounded parallelism across series. Each series is independent, but
    // we don't want to saturate the DB pool with hundreds of parallel runs.
    const CONCURRENCY = 5;
    for (let i = 0; i < seriesToProcess.length; i += CONCURRENCY) {
      const batch = seriesToProcess.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map((series) =>
          generateInstancesForSeries({
            seriesId: series.id,
            until,
            createdByMemberId: null, // system caller
          }).then((result) => ({ series, result }))
        )
      );

      for (let j = 0; j < results.length; j++) {
        const settled = results[j];
        const series = batch[j];
        if (settled.status === "fulfilled") {
          const { result } = settled.value;
          totalCreated += result.created;
          totalSkipped += result.skipped.length;

          if (result.skipped.length > 0) {
            log.info("lesson instances skipped during roll-forward", {
              seriesId: series.id,
              organizationId: series.organizationId,
              skipped: result.skipped,
            });
          }
        } else {
          errors++;
          log.error(
            settled.reason,
            "failed to generate lesson instances for series",
            {
              seriesId: series.id,
              organizationId: series.organizationId,
            }
          );
        }
      }
    }

    log.info("lesson roll-forward complete", {
      environment: appMeta().environment.type,
      windowWeeks,
      seriesProcessed: seriesToProcess.length,
      totalCreated,
      totalSkipped,
      errors,
    });

    return {
      seriesProcessed: seriesToProcess.length,
      totalCreated,
      totalSkipped,
      errors,
    };
  }
);

const _ = new CronJob("roll-forward-lesson-instances", {
  title: "Extend lesson instance window for all active series",
  schedule: "0 6 * * *", // 6am UTC daily (~1am Central)
  endpoint: rollForwardLessonInstances,
});
