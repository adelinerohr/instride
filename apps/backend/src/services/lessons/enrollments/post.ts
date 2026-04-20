import {
  LessonInstanceEnrollmentStatus,
  LessonInstanceStatus,
  LessonSeriesEnrollmentStatus,
  LessonSeriesStatus,
} from "@instride/shared";
import { eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";

import { db } from "../db";
import { lessonInstanceEnrollments, lessonSeriesEnrollments } from "../schema";
import { GetInstanceEnrollmentResponse } from "../types/contracts";
import {
  LessonInstanceEnrollment,
  LessonSeriesEnrollment,
} from "../types/models";
import { createInstanceEnrollment, createSeriesEnrollment } from "./utils";

// ------------------------------------------------------------
// Instance Enrollments
// ------------------------------------------------------------

interface EnrollInInstanceRequest {
  instanceId: string;
  riderIds: string | string[];
  enrolledByMemberId?: string;
}

export interface EnrollInInstanceResponse {
  enrollment: LessonInstanceEnrollment | LessonInstanceEnrollment[];
}

export const enrollInInstance = api(
  {
    expose: true,
    method: "POST",
    path: "/lessons/instances/:instanceId/enroll",
    auth: true,
  },
  async (
    request: EnrollInInstanceRequest
  ): Promise<EnrollInInstanceResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const instance = await db.query.lessonInstances.findFirst({
      where: {
        id: request.instanceId,
      },
    });

    if (!instance) {
      throw APIError.notFound("Instance not found");
    }

    if (instance.organizationId !== organizationId) {
      throw APIError.permissionDenied("Lesson is not in your organization");
    }

    if (instance.status === LessonInstanceStatus.CANCELLED) {
      throw APIError.failedPrecondition("Lesson instance is cancelled");
    }

    if (Array.isArray(request.riderIds)) {
      const enrollments = await Promise.all(
        request.riderIds.map((riderId) =>
          createInstanceEnrollment({
            instanceId: instance.id,
            riderId,
            enrolledByMemberId: request.enrolledByMemberId
              ? request.enrolledByMemberId
              : member.id,
          })
        )
      );
      return { enrollment: enrollments };
    }

    return {
      enrollment: await createInstanceEnrollment({
        instanceId: instance.id,
        riderId: request.riderIds as string,
        enrolledByMemberId: request.enrolledByMemberId
          ? request.enrolledByMemberId
          : member.id,
      }),
    };
  }
);

export const unenrollFromInstance = api(
  {
    expose: true,
    method: "POST",
    path: "/lessons/instances/enrollments/:enrollmentId/unenroll",
    auth: true,
  },
  async ({ enrollmentId }: { enrollmentId: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const enrollment = await db.query.lessonInstanceEnrollments.findFirst({
      where: { id: enrollmentId, organizationId },
    });

    if (!enrollment) {
      throw APIError.notFound("Enrollment not found");
    }

    await db
      .update(lessonInstanceEnrollments)
      .set({
        status: LessonInstanceEnrollmentStatus.CANCELLED,
        unenrolledAt: new Date(),
        unenrolledByMemberId: member.id,
      })
      .where(eq(lessonInstanceEnrollments.id, enrollment.id));
  }
);

// ------------------------------------------------------------
// Series Enrollments
// ------------------------------------------------------------

interface EnrollInSeriesRequest {
  seriesId: string;
  riderIds: string | string[];
  startDate: string;
  endDate: string | null;
}

interface EnrollInSeriesResponse {
  enrollment: LessonSeriesEnrollment | LessonSeriesEnrollment[];
}

export const enrollInSeries = api(
  {
    expose: true,
    method: "POST",
    path: "/lessons/series/:seriesId/enroll",
    auth: true,
  },
  async (request: EnrollInSeriesRequest): Promise<EnrollInSeriesResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const series = await db.query.lessonSeries.findFirst({
      where: { id: request.seriesId },
    });

    if (!series) {
      throw APIError.notFound("Series not found");
    }

    if (series.organizationId !== organizationId) {
      throw APIError.permissionDenied("Series is not in your organization");
    }

    if (series.status !== LessonSeriesStatus.ACTIVE) {
      throw APIError.failedPrecondition("Series is cancelled");
    }

    if (Array.isArray(request.riderIds)) {
      const enrollments = await Promise.all(
        request.riderIds.map((riderId) =>
          createSeriesEnrollment({
            organizationId: series.organizationId,
            seriesId: request.seriesId,
            riderId,
            enrolledByMemberId: member.id,
            startDate: request.startDate,
            endDate: request.endDate,
          })
        )
      );
      return { enrollment: enrollments };
    }

    return {
      enrollment: await createSeriesEnrollment({
        organizationId: series.organizationId,
        seriesId: request.seriesId,
        riderId: request.riderIds as string,
        enrolledByMemberId: member.id,
        startDate: request.startDate,
        endDate: request.endDate,
      }),
    };
  }
);

export const unenrollFromSeries = api(
  {
    expose: true,
    method: "POST",
    path: "/lessons/series/:seriesId/unenroll",
    auth: true,
  },
  async ({ seriesId }: { seriesId: string }): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const enrollment = await db.query.lessonSeriesEnrollments.findFirst({
      where: { seriesId },
    });

    if (!enrollment) {
      throw APIError.notFound("Enrollment not found");
    }

    if (enrollment.organizationId !== organizationId) {
      throw APIError.permissionDenied("Enrollment is not in your organization");
    }

    await db
      .update(lessonSeriesEnrollments)
      .set({
        status: LessonSeriesEnrollmentStatus.CANCELLED,
        endedAt: new Date(),
        endedByMemberId: member.id,
      })
      .where(eq(lessonSeriesEnrollments.id, enrollment.id));
  }
);

// ------------------------------------------------------------
// Enrollment Helpers
// ------------------------------------------------------------

interface MarkAttendanceRequest {
  enrollmentId: string;
  attended: boolean;
}

export const markAttendance = api(
  {
    expose: true,
    method: "POST",
    path: "/lessons/instances/enrollments/:enrollmentId/mark-attendance",
    auth: true,
  },
  async (
    request: MarkAttendanceRequest
  ): Promise<GetInstanceEnrollmentResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const existing = await db.query.lessonInstanceEnrollments.findFirst({
      where: { id: request.enrollmentId },
    });
    if (!existing) {
      throw APIError.notFound("Enrollment not found");
    }
    if (existing.organizationId !== organizationId) {
      throw APIError.permissionDenied("Enrollment is not in your organization");
    }

    const [enrollment] = await db
      .update(lessonInstanceEnrollments)
      .set({
        attended: request.attended,
        attendedAt: request.attended ? new Date() : null,
        markedByMemberId: member.id,
        status: request.attended
          ? LessonInstanceEnrollmentStatus.ATTENDED
          : LessonInstanceEnrollmentStatus.NO_SHOW,
      })
      .where(eq(lessonInstanceEnrollments.id, request.enrollmentId))
      .returning();

    return { enrollment };
  }
);
