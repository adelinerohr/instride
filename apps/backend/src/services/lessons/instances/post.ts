import { LessonInstanceStatus } from "@instride/shared";
import { and, eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";

import { db } from "../db";
import { listInstanceEnrollments } from "../enrollments/get";
import { enrollInInstance, unenrollFromInstance } from "../enrollments/post";
import { lessonInstances } from "../schema";
import { lessonCreated } from "../topics";
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
  name?: string | null;
  levelId?: string | null;
  notes?: string | null;
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

    const instance = await db.transaction(async (tx) => {
      const [instance] = await tx
        .insert(lessonInstances)
        .values({
          ...request,
          start: new Date(request.start),
          end: new Date(request.end),
          status: LessonInstanceStatus.SCHEDULED,
          organizationId,
          createdByMemberId: member.id,
        })
        .returning();

      return await tx.query.lessonInstances.findFirst({
        where: {
          id: instance.id,
        },
        with: {
          series: {
            with: {
              trainer: {
                with: {
                  member: {
                    with: {
                      authUser: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    if (!instance || !instance.series) {
      throw APIError.internal("Failed to create lesson instance");
    }

    lessonCreated.publish({
      instanceId: instance.id,
      seriesId: instance.seriesId,
      organizationId,
      trainerId: instance.trainerId,
      trainerMemberId: instance.series.trainer?.memberId ?? "",
      trainerName: instance.series.trainer?.member?.authUser?.name ?? "",
      boardId: instance.boardId,
      serviceId: instance.serviceId,
      levelId: instance.levelId ?? null,
      startTime: instance.start.toISOString(),
      endTime: instance.end.toISOString(),
      maxRiders: instance.maxRiders,
      name: instance.name,
      isRecurring: instance.series?.isRecurring ?? false,
    });

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
    const { organizationId } = requireOrganizationAuth();
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
      .where(
        and(
          eq(lessonInstances.id, instanceId),
          eq(lessonInstances.organizationId, organizationId)
        )
      )
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
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const [instance] = await db
      .update(lessonInstances)
      .set({
        status: LessonInstanceStatus.CANCELLED,
        canceledAt: new Date(),
        cancelReason: request.reason ?? null,
        canceledByMemberId: member.id,
      })
      .where(
        and(
          eq(lessonInstances.id, request.instanceId),
          eq(lessonInstances.organizationId, organizationId)
        )
      )
      .returning();

    return { instance };
  }
);
