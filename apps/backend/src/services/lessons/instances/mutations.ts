import type {
  CreateLessonInstanceRequest,
  GetLessonInstanceResponse,
  UpdateLessonInstanceRequest,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";

import { instanceEnrollmentService } from "../enrollments/enrollment.service";
import { toLessonInstance } from "../mappers";
import {
  createInstanceWithPublish,
  lessonInstanceService,
} from "./instance.service";

export const createLessonInstance = api(
  { expose: true, method: "POST", path: "/lessons/instances", auth: true },
  async (
    request: CreateLessonInstanceRequest
  ): Promise<GetLessonInstanceResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const { instance } = await createInstanceWithPublish({
      ...request,
      organizationId,
      createdByMemberId: member.id,
    });

    return { instance: toLessonInstance(instance) };
  }
);

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

    await lessonInstanceService.update(instanceId, organizationId, {
      ...rest,
      start: rest.start ? new Date(rest.start) : undefined,
      end: rest.end ? new Date(rest.end) : undefined,
    });

    if (request.riderIds) {
      const enrollments = await instanceEnrollmentService.findManyByInstance({
        instanceId,
        organizationId,
      });

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
        ...newRiderIds.map((riderId) =>
          instanceEnrollmentService.enroll({
            instanceId,
            riderId,
            enrolledByMemberId: member.id,
            idempotent: false,
          })
        ),
        ...removedEnrollments.map((enrollment) =>
          instanceEnrollmentService.unenroll({
            enrollmentId: enrollment.id,
            organizationId,
            unenrolledByMemberId: member.id,
          })
        ),
      ]);
    }

    const updatedInstance = await lessonInstanceService.findOneExpanded(
      instanceId,
      organizationId
    );

    return { instance: toLessonInstance(updatedInstance) };
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

    await lessonInstanceService.cancel(request.instanceId, organizationId, {
      canceledByMemberId: member.id,
      reason: request.reason ?? null,
    });

    const updatedInstance = await lessonInstanceService.findOneExpanded(
      request.instanceId,
      organizationId
    );

    return { instance: toLessonInstance(updatedInstance) };
  }
);
