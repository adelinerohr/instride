import {
  LessonInstanceEnrollmentStatus,
  LessonSeriesEnrollmentStatus,
} from "@instride/shared";
import { and, eq, sql } from "drizzle-orm";
import { APIError } from "encore.dev/api";

import { db } from "../db";
import {
  lessonInstanceEnrollments,
  lessonInstances,
  lessonSeriesEnrollments,
} from "../schema";
import { lessonEnrolled } from "../topics";
import {
  LessonInstance,
  LessonInstanceEnrollment,
  LessonSeriesEnrollment,
} from "../types/models";

interface CreateSeriesEnrollmentParams {
  seriesId: string;
  organizationId: string;
  riderId: string;
  enrolledByMemberId: string;
  startDate: string;
  endDate: string | null;
}

export async function createSeriesEnrollment({
  seriesId,
  organizationId,
  riderId,
  enrolledByMemberId,
  startDate,
  endDate,
}: CreateSeriesEnrollmentParams): Promise<LessonSeriesEnrollment> {
  const existing = await db.query.lessonSeriesEnrollments.findFirst({
    where: { seriesId, riderId },
  });

  if (existing && existing.status !== LessonSeriesEnrollmentStatus.CANCELLED) {
    throw APIError.alreadyExists("Already enrolled in this series");
  }

  const [enrollment] = await db
    .insert(lessonSeriesEnrollments)
    .values({
      organizationId,
      seriesId,
      riderId,
      status: LessonSeriesEnrollmentStatus.ACTIVE,
      startDate,
      endDate,
      enrolledByMemberId,
    })
    .onConflictDoUpdate({
      target: [
        lessonSeriesEnrollments.seriesId,
        lessonSeriesEnrollments.riderId,
      ],
      set: {
        status: LessonSeriesEnrollmentStatus.ACTIVE,
        startDate,
        endDate,
      },
    })
    .returning();

  return enrollment;
}

interface CreateInstanceEnrollmentParams {
  instanceId: string;
  riderId: string;
  enrolledByMemberId: string;
  fromSeriesEnrollmentId?: string;
}

export async function createInstanceEnrollment({
  instanceId,
  riderId,
  enrolledByMemberId,
  fromSeriesEnrollmentId,
}: CreateInstanceEnrollmentParams): Promise<LessonInstanceEnrollment> {
  return db.transaction(async (tx) => {
    // 1) Lock the instance row so all capacity-changing operations for this
    // instance serialize behind the same lock.
    const lockedRows = await tx
      .select()
      .from(lessonInstances)
      .where(eq(lessonInstances.id, instanceId))
      .for("update");

    const lockedInstance = lockedRows[0];

    if (!lockedInstance) {
      throw APIError.notFound("Lesson instance not found");
    }

    if (lockedInstance.status !== "scheduled") {
      throw APIError.failedPrecondition("Lesson instance is not bookable");
    }

    // 2) Check whether this rider already has an enrollment row.
    const existing = await tx.query.lessonInstanceEnrollments.findFirst({
      where: {
        instanceId,
        riderId,
      },
    });

    if (
      existing &&
      existing.status !== LessonInstanceEnrollmentStatus.CANCELLED
    ) {
      throw APIError.alreadyExists("Already enrolled in this lesson");
    }

    // 3) Count active enrolled riders while still holding the instance lock.
    const [{ count: enrolledCount }] = await tx
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(lessonInstanceEnrollments)
      .where(
        and(
          eq(lessonInstanceEnrollments.instanceId, instanceId),
          eq(
            lessonInstanceEnrollments.status,
            LessonInstanceEnrollmentStatus.ENROLLED
          )
        )
      );

    // If reactivating a cancelled row, it still consumes a slot again,
    // so capacity check still applies.
    if (enrolledCount >= lockedInstance.maxRiders) {
      throw APIError.resourceExhausted("Lesson instance is full");
    }

    const data = {
      organizationId: lockedInstance.organizationId,
      instanceId: lockedInstance.id,
      riderId,
      status: LessonInstanceEnrollmentStatus.ENROLLED,
      waitlistPosition: null,
      enrolledByMemberId,
      fromSeriesEnrollmentId: fromSeriesEnrollmentId ?? null,
      unenrolledAt: null,
      unenrolledByMemberId: null,
    };

    if (existing) {
      const [updated] = await tx
        .update(lessonInstanceEnrollments)
        .set(data)
        .where(eq(lessonInstanceEnrollments.id, existing.id))
        .returning();

      return {
        ...updated,
        instance: lockedInstance as LessonInstance,
      };
    }

    const [created] = await tx
      .insert(lessonInstanceEnrollments)
      .values(data)
      .returning();

    const rider = await tx.query.riders.findFirst({
      where: {
        id: riderId,
      },
      with: {
        member: {
          with: {
            authUser: true,
          },
        },
      },
    });

    if (!rider || !rider.member || !rider.member.authUser) {
      throw APIError.notFound("Rider not found");
    }

    const trainer = await tx.query.trainers.findFirst({
      where: {
        id: lockedInstance.trainerId,
      },
      with: {
        member: {
          with: {
            authUser: true,
          },
        },
      },
    });

    if (!trainer || !trainer.member || !trainer.member.authUser) {
      throw APIError.notFound("Trainer not found");
    }

    lessonEnrolled.publish({
      instanceId: lockedInstance.id,
      seriesId: lockedInstance.seriesId,
      organizationId: lockedInstance.organizationId,
      riderId: riderId,
      riderMemberId: rider.memberId,
      riderName: rider.member.authUser.name,
      enrolledByMemberId: enrolledByMemberId,
      trainerId: lockedInstance.trainerId,
      trainerMemberId: trainer.memberId,
      trainerName: trainer.member.authUser.name,
      startTime: lockedInstance.start.toISOString(),
      endTime: lockedInstance.end.toISOString(),
      lessonName: lockedInstance.name,
    });

    return {
      ...created,
      instance: lockedInstance as LessonInstance,
    };
  });
}
