import { LessonInstanceStatus } from "@instride/shared";
import { eq } from "drizzle-orm";
import { api } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import { listInstanceEnrollments } from "../enrollments/get";
import { enrollInInstance, unenrollFromInstance } from "../enrollments/post";
import { lessonInstances } from "../schema";
import { GetLessonInstanceResponse } from "../types/contracts";

interface CreateLessonInstanceRequest {
  boardId: string;
  trainerId: string;
  maxRiders: number;
  serviceId: string;
  start: string;
  seriesId: string;
  end: string;
  occurrenceKey: string;
  name?: string;
  status?: LessonInstanceStatus;
  levelId?: string;
  notes?: string;
}

export const createLessonInstance = api(
  {
    expose: true,
    method: "POST",
    path: "/lessons/instances",
    auth: true,
  },
  async (
    request: CreateLessonInstanceRequest
  ): Promise<GetLessonInstanceResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const [instance] = await db
      .insert(lessonInstances)
      .values({
        ...request,
        start: new Date(request.start),
        end: new Date(request.end),
        organizationId,
        createdByMemberId: member.id,
      })
      .returning();

    return { instance };
  }
);

interface UpdateLessonInstanceRequest {
  instanceId: string;
  boardId: string;
  trainerId: string;
  maxRiders: number;
  serviceId: string;
  start: string;
  end: string;
  name: string | null;
  status?: LessonInstanceStatus;
  levelId?: string | null;
  notes?: string | null;
  riderIds?: string[] | null;
}

export const updateLessonInstance = api(
  {
    expose: true,
    method: "PUT",
    path: "/lessons/instances/:instanceId",
    auth: true,
  },
  async (
    request: UpdateLessonInstanceRequest
  ): Promise<GetLessonInstanceResponse> => {
    const { member } = await organizations.getMember();
    const { instanceId, ...rest } = request;

    const [instance] = await db
      .update(lessonInstances)
      .set({
        ...rest,
        start: rest.start ? new Date(rest.start) : undefined,
        end: rest.end ? new Date(rest.end) : undefined,
        updatedByMemberId: member.id,
        updatedAt: new Date(),
      })
      .where(eq(lessonInstances.id, instanceId))
      .returning();

    if (request.riderIds) {
      const { enrollments } = await listInstanceEnrollments({ id: instanceId });

      const existingRiderIds = enrollments.map(
        (enrollment) => enrollment.riderId
      );
      const newRiderIds = request.riderIds.filter(
        (riderId) => !existingRiderIds.includes(riderId)
      );
      const removedRiderIds = existingRiderIds.filter(
        (riderId) => !request.riderIds?.includes(riderId)
      );

      const removedEnrollments = enrollments.filter((enrollment) =>
        removedRiderIds.includes(enrollment.riderId)
      );

      await Promise.all([
        enrollInInstance({ instanceId, riderIds: newRiderIds }),
        ...removedEnrollments.map((enrollment) =>
          unenrollFromInstance({ enrollmentId: enrollment.id })
        ),
      ]);
    }

    return { instance };
  }
);

interface CancelLessonInstanceRequest {
  instanceId: string;
  reason?: string;
}

export const cancelLessonInstance = api(
  {
    expose: true,
    method: "POST",
    path: "/lessons/instances/:instanceId/cancel",
    auth: true,
  },
  async (
    request: CancelLessonInstanceRequest
  ): Promise<GetLessonInstanceResponse> => {
    const { member } = await organizations.getMember();

    const [instance] = await db
      .update(lessonInstances)
      .set({
        status: LessonInstanceStatus.CANCELLED,
        canceledAt: new Date(),
        cancelReason: request.reason ?? null,
        canceledByMemberId: member.id,
      })
      .where(eq(lessonInstances.id, request.instanceId))
      .returning();

    return { instance };
  }
);
