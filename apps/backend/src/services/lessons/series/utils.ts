import { LessonSeriesEnrollmentStatus } from "@instride/shared/models/enums";
import { eq, inArray } from "drizzle-orm";

import { db } from "../db";
import { lessonSeriesEnrollments } from "../schema";

/** `db` or the `tx` passed to `db.transaction((tx) => …)`. */
type DbOrTransaction =
  | typeof db
  | Parameters<Parameters<typeof db.transaction>[0]>[0];

interface SyncSeriesEnrollmentsParams {
  tx: DbOrTransaction;
  organizationId: string;
  seriesId: string;
  riderIds: string[];
  memberId: string;
  startDate: string;
  endDate: string | null;
}

export async function syncSeriesEnrollments({
  tx,
  organizationId,
  seriesId,
  riderIds,
  memberId,
  startDate,
  endDate,
}: SyncSeriesEnrollmentsParams): Promise<void> {
  const existing = await tx.query.lessonSeriesEnrollments.findMany({
    where: {
      seriesId,
    },
  });

  const activeExisting = existing.filter(
    (e) => e.status === LessonSeriesEnrollmentStatus.ACTIVE
  );

  const existingByRiderId = new Map(existing.map((e) => [e.riderId, e]));
  const activeRiderIds = new Set(activeExisting.map((e) => e.riderId));
  const requestedRiderIds = new Set(riderIds);

  const toAdd = riderIds.filter((riderId) => !activeRiderIds.has(riderId));
  const toCancel = activeExisting
    .filter((e) => !requestedRiderIds.has(e.riderId))
    .map((e) => e.id);

  for (const riderId of toAdd) {
    const existingEnrollment = existingByRiderId.get(riderId);

    if (existingEnrollment) {
      await tx
        .update(lessonSeriesEnrollments)
        .set({
          status: LessonSeriesEnrollmentStatus.ACTIVE,
          startDate,
          endDate,
          endedAt: null,
          endedByMemberId: null,
          enrolledByMemberId: memberId,
          updatedAt: new Date(),
        })
        .where(eq(lessonSeriesEnrollments.id, existingEnrollment.id));
    } else {
      await tx.insert(lessonSeriesEnrollments).values({
        organizationId,
        seriesId,
        riderId,
        status: LessonSeriesEnrollmentStatus.ACTIVE,
        startDate,
        endDate,
        enrolledByMemberId: memberId,
      });
    }
  }

  if (toCancel.length > 0) {
    await tx
      .update(lessonSeriesEnrollments)
      .set({
        status: LessonSeriesEnrollmentStatus.CANCELLED,
        endedAt: new Date(),
        endedByMemberId: memberId,
        updatedAt: new Date(),
      })
      .where(inArray(lessonSeriesEnrollments.id, toCancel));
  }
}
