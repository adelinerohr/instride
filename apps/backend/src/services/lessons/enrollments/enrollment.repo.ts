import {
  LessonInstanceEnrollmentStatus,
  LessonSeriesEnrollmentStatus,
} from "@instride/shared";
import { and, eq, lte, gte, inArray, sql } from "drizzle-orm";
import { APIError } from "encore.dev/api";

import { riderExpansion } from "@/services/organizations/fragments";
import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { lessonInstanceExpansion } from "../fragments";
import { toSeriesEnrollment } from "../mappers";
import {
  lessonInstanceEnrollments,
  lessonInstances,
  lessonSeriesEnrollments,
  NewLessonSeriesEnrollmentRow,
  type LessonInstanceEnrollmentRow,
} from "../schema";

// ================================================================================================================
// Instance Enrollments
// ================================================================================================================

export const createInstanceEnrollmentRepo = (
  client: Database | Transaction = db
) => ({
  /**
   * Enroll a rider into an instance with row-level locking and capacity check.
   * If `idempotent` is true, returns existing active enrollment without error.
   * Caller handles pub/sub publishing.
   */
  enroll: async (params: {
    instanceId: string;
    riderId: string;
    enrolledByMemberId: string | null;
    fromSeriesEnrollmentId?: string;
    idempotent: boolean;
  }) => {
    return await client.transaction(async (tx) => {
      // Lock the instance row
      const [lockedInstance] = await tx
        .select()
        .from(lessonInstances)
        .where(eq(lessonInstances.id, params.instanceId))
        .for("update");

      assertExists(lockedInstance, "Lesson instance not found");

      if (lockedInstance.status !== "scheduled") {
        throw APIError.failedPrecondition("Lesson instance is not bookable");
      }

      const existing = await tx.query.lessonInstanceEnrollments.findFirst({
        where: {
          instanceId: params.instanceId,
          riderId: params.riderId,
        },
      });

      if (
        existing &&
        existing.status !== LessonInstanceEnrollmentStatus.CANCELLED
      ) {
        if (params.idempotent) {
          return {
            enrollment: existing,
            instance: lockedInstance,
            wasCreated: false,
          };
        }
        throw APIError.alreadyExists("Already enrolled in this lesson");
      }

      const [{ count: enrolledCount }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(lessonInstanceEnrollments)
        .where(
          and(
            eq(lessonInstanceEnrollments.instanceId, params.instanceId),
            eq(
              lessonInstanceEnrollments.status,
              LessonInstanceEnrollmentStatus.ENROLLED
            )
          )
        );

      if (enrolledCount >= lockedInstance.maxRiders) {
        throw APIError.resourceExhausted("Lesson instance is full");
      }

      const data = {
        organizationId: lockedInstance.organizationId,
        instanceId: lockedInstance.id,
        riderId: params.riderId,
        status: LessonInstanceEnrollmentStatus.ENROLLED,
        waitlistPosition: null,
        enrolledByMemberId: params.enrolledByMemberId,
        fromSeriesEnrollmentId: params.fromSeriesEnrollmentId ?? null,
        unenrolledAt: null,
        unenrolledByMemberId: null,
      };

      let enrollment: LessonInstanceEnrollmentRow;
      if (existing) {
        [enrollment] = await tx
          .update(lessonInstanceEnrollments)
          .set(data)
          .where(eq(lessonInstanceEnrollments.id, existing.id))
          .returning();
      } else {
        [enrollment] = await tx
          .insert(lessonInstanceEnrollments)
          .values(data)
          .returning();
      }

      return { enrollment, instance: lockedInstance, wasCreated: true };
    });
  },

  findOne: async (id: string, organizationId: string) => {
    const enrollment = await client.query.lessonInstanceEnrollments.findFirst({
      where: { id, organizationId },
      with: { rider: { with: riderExpansion } },
    });
    assertExists(enrollment, "Lesson instance enrollment not found");
    return enrollment;
  },

  findManyByInstance: async (params: {
    instanceId: string;
    organizationId: string;
    riderIds?: string[];
  }) => {
    return await client.query.lessonInstanceEnrollments.findMany({
      where: {
        instanceId: params.instanceId,
        organizationId: params.organizationId,
        ...(params.riderIds && { riderId: { in: params.riderIds } }),
      },
      with: { rider: { with: riderExpansion } },
    });
  },

  findManyForRiders: async (params: {
    organizationId: string;
    riderIds: string[];
    range?: { from: Date; to: Date };
  }) => {
    const rows = await client
      .select()
      .from(lessonInstanceEnrollments)
      .innerJoin(
        lessonInstances,
        eq(lessonInstanceEnrollments.instanceId, lessonInstances.id)
      )
      .where(
        and(
          eq(lessonInstanceEnrollments.organizationId, params.organizationId),
          inArray(lessonInstanceEnrollments.riderId, params.riderIds),
          params.range
            ? and(
                gte(lessonInstances.start, params.range.from),
                lte(lessonInstances.start, params.range.to)
              )
            : undefined
        )
      );
    const enrollmentIds = rows
      .map((row) => row.lesson_instance_enrollments.id)
      .filter(Boolean);

    const enrollments = await client.query.lessonInstanceEnrollments.findMany({
      where: {
        id: {
          in: enrollmentIds,
        },
      },
      with: {
        rider: { with: riderExpansion },
        instance: {
          with: lessonInstanceExpansion,
        },
      },
    });
    return enrollments;
  },

  unenroll: async (params: {
    enrollmentId: string;
    organizationId: string;
    unenrolledByMemberId: string;
  }) => {
    const [enrollment] = await client
      .update(lessonInstanceEnrollments)
      .set({
        status: LessonInstanceEnrollmentStatus.CANCELLED,
        unenrolledAt: new Date(),
        unenrolledByMemberId: params.unenrolledByMemberId,
      })
      .where(
        and(
          eq(lessonInstanceEnrollments.id, params.enrollmentId),
          eq(lessonInstanceEnrollments.organizationId, params.organizationId)
        )
      )
      .returning();
    assertExists(enrollment, "Enrollment not found");
    return enrollment;
  },

  markAttendance: async (
    enrollmentId: string,
    organizationId: string,
    request: { attended: boolean; markedByMemberId: string }
  ) => {
    const [enrollment] = await client
      .update(lessonInstanceEnrollments)
      .set({
        attended: request.attended,
        attendedAt: request.attended ? new Date() : null,
        markedByMemberId: request.markedByMemberId,
        status: request.attended
          ? LessonInstanceEnrollmentStatus.ATTENDED
          : LessonInstanceEnrollmentStatus.NO_SHOW,
      })
      .where(
        and(
          eq(lessonInstanceEnrollments.id, enrollmentId),
          eq(lessonInstanceEnrollments.organizationId, organizationId)
        )
      )
      .returning();
    assertExists(enrollment, "Enrollment not found");
    return enrollment;
  },
});

export const instanceEnrollmentRepo = createInstanceEnrollmentRepo();

// ================================================================================================================
// Series Enrollments
// ================================================================================================================

export const createSeriesEnrollmentRepo = (
  client: Database | Transaction = db
) => ({
  upsert: async (data: NewLessonSeriesEnrollmentRow) => {
    const existing = await client.query.lessonSeriesEnrollments.findFirst({
      where: { seriesId: data.seriesId, riderId: data.riderId },
    });

    if (
      existing &&
      existing.status !== LessonSeriesEnrollmentStatus.CANCELLED
    ) {
      throw APIError.alreadyExists("Already enrolled in this series");
    }

    const [enrollment] = await client
      .insert(lessonSeriesEnrollments)
      .values({
        ...data,
        status: LessonSeriesEnrollmentStatus.ACTIVE,
      })
      .onConflictDoUpdate({
        target: [
          lessonSeriesEnrollments.seriesId,
          lessonSeriesEnrollments.riderId,
        ],
        set: {
          status: LessonSeriesEnrollmentStatus.ACTIVE,
          startDate: data.startDate,
          endDate: data.endDate,
        },
      })
      .returning();

    assertExists(enrollment, "Failed to upsert series enrollment");
    return enrollment;
  },

  findOne: async (id: string, organizationId: string, riderId?: string) => {
    const enrollment = await client.query.lessonSeriesEnrollments.findFirst({
      where: { id, organizationId, ...(riderId ? { riderId } : {}) },
    });
    assertExists(enrollment, "Lesson series enrollment not found");
    return enrollment;
  },

  findMany: async (
    seriesId: string,
    organizationId: string,
    filters?: { isActive?: boolean; succeededIds?: string[] }
  ) => {
    const enrollments = await client.query.lessonSeriesEnrollments.findMany({
      where: {
        seriesId,
        organizationId,
        ...(filters?.isActive
          ? { status: LessonSeriesEnrollmentStatus.ACTIVE }
          : {}),
        ...(filters?.succeededIds ? { id: { in: filters.succeededIds } } : {}),
      },
      with: { rider: { with: riderExpansion } },
    });
    return enrollments.map(toSeriesEnrollment);
  },

  cancel: async (params: {
    seriesId: string;
    riderId: string;
    organizationId: string;
    endedByMemberId: string;
  }) => {
    await client
      .update(lessonSeriesEnrollments)
      .set({
        status: LessonSeriesEnrollmentStatus.CANCELLED,
        endedAt: new Date(),
        endedByMemberId: params.endedByMemberId,
      })
      .where(
        and(
          eq(lessonSeriesEnrollments.seriesId, params.seriesId),
          eq(lessonSeriesEnrollments.riderId, params.riderId),
          eq(lessonSeriesEnrollments.organizationId, params.organizationId)
        )
      );
  },
});

export const seriesEnrollmentRepo = createSeriesEnrollmentRepo();
