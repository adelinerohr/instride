import {
  LessonInstanceEnrollmentStatus,
  LessonSeriesEnrollmentStatus,
} from "@instride/shared";
import { and, eq } from "drizzle-orm";
import { APIError } from "encore.dev/api";

import { db } from "@/database";

import { lessonInstanceEnrollments, lessonSeriesEnrollments } from "../schema";
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
  instance: LessonInstance;
  riderId: string;
  enrolledByMemberId: string;
  fromSeriesEnrollmentId?: string;
}

export async function createInstanceEnrollment({
  instance,
  riderId,
  enrolledByMemberId,
  fromSeriesEnrollmentId,
}: CreateInstanceEnrollmentParams): Promise<LessonInstanceEnrollment> {
  const existing = await db.query.lessonInstanceEnrollments.findFirst({
    where: { instanceId: instance.id, riderId },
  });

  if (
    existing &&
    existing.status !== LessonInstanceEnrollmentStatus.CANCELLED
  ) {
    throw APIError.alreadyExists("Already enrolled in this lesson");
  }

  const enrolledCount = await db.$count(
    lessonInstanceEnrollments,
    and(
      eq(lessonInstanceEnrollments.instanceId, instance.id),
      eq(
        lessonInstanceEnrollments.status,
        LessonInstanceEnrollmentStatus.ENROLLED
      )
    )
  );

  const isFull = enrolledCount >= instance.maxRiders;

  if (isFull) throw APIError.resourceExhausted("Lesson instance is full");

  const data = {
    organizationId: instance.organizationId,
    instanceId: instance.id,
    riderId,
    status: LessonInstanceEnrollmentStatus.ENROLLED,
    waitlistPosition: null,
    enrolledByMemberId,
    fromSeriesEnrollmentId: fromSeriesEnrollmentId ?? null,
  };

  if (existing) {
    const [updated] = await db
      .update(lessonInstanceEnrollments)
      .set(data)
      .where(eq(lessonInstanceEnrollments.id, existing.id))
      .returning();
    return { ...updated, instance: instance as LessonInstance };
  }

  const [enrollment] = await db
    .insert(lessonInstanceEnrollments)
    .values(data)
    .returning();
  return { ...enrollment, instance: instance as LessonInstance };
}
