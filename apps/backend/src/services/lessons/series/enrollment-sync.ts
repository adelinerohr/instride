import { LessonSeriesEnrollmentStatus } from "@instride/shared";
import { eq, inArray } from "drizzle-orm";

import { Database, Transaction } from "@/shared/utils/schema";

import { lessonSeriesEnrollments } from "../schema";

interface SyncSeriesEnrollmentsParams {
  client: Transaction | Database;
  organizationId: string;
  seriesId: string;
  riderIds: string[];
  memberId: string;
  startDate: string;
  endDate: string | null;
}

export async function syncSeriesEnrollments({
  client,
  organizationId,
  seriesId,
  riderIds,
  memberId,
  startDate,
  endDate,
}: SyncSeriesEnrollmentsParams): Promise<void> {
  const existing = await client.query.lessonSeriesEnrollments.findMany({
    where: { seriesId },
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
      await client
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
      await client.insert(lessonSeriesEnrollments).values({
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
    await client
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
