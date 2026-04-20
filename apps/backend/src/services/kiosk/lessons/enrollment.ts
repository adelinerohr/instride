import { api, APIError } from "encore.dev/api";
import { lessons } from "~encore/clients";

import { EnrollInInstanceResponse } from "@/services/lessons/enrollments/post";
import { requireOrganizationAuth } from "@/shared/auth";

import { db } from "../db";
import { assertKioskActionAllowed } from "../permissions";
import { getKioskSession } from "../sessions";
import { KioskAction } from "../types/models";
import { assertKioskBookingRules } from "./validation";

interface KioskEnrollInInstanceRequest {
  sessionId: string;
  instanceId: string;
  riderMemberId: string;
}

export const kioskEnrollInInstance = api(
  {
    method: "POST",
    path: "/kiosk/lessons/instances/:instanceId/enroll",
    expose: true,
    auth: true,
  },
  async (
    request: KioskEnrollInInstanceRequest
  ): Promise<EnrollInInstanceResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const { acting } = await getKioskSession({ sessionId: request.sessionId });

    if (!acting || !acting.actingMemberId) {
      throw APIError.notFound("Invalid acting token");
    }

    assertKioskActionAllowed({
      action: KioskAction.ENROLL,
      actingMemberId: acting.actingMemberId,
      scope: acting.scope,
      targetMemberId: request.riderMemberId,
    });

    const rider = await db.query.riders.findFirst({
      where: {
        memberId: request.riderMemberId,
        organizationId,
      },
      with: {
        member: true,
      },
    });

    if (!rider || !rider.member) {
      throw APIError.notFound("Rider not found");
    }

    const instance = await db.query.lessonInstances.findFirst({
      where: {
        id: request.instanceId,
        organizationId,
      },
    });

    if (!instance) {
      throw APIError.notFound("Lesson instance not found");
    }

    const { canBook, reason } = await assertKioskBookingRules({
      rider,
      instance,
      scope: acting.scope,
    });

    if (!canBook) {
      throw APIError.permissionDenied(reason?.message || "Cannot book lesson");
    }

    return await lessons.enrollInInstance({
      instanceId: request.instanceId,
      riderIds: [rider.id],
      enrolledByMemberId: acting.actingMemberId,
    });
  }
);

interface KioskUnenrollFromInstanceRequest {
  sessionId: string;
  enrollmentId: string;
}

export const kioskUnenrollFromInstance = api(
  {
    method: "POST",
    path: "/kiosk/lessons/enrollments/:enrollmentId/unenroll",
    expose: true,
    auth: true,
  },
  async (request: KioskUnenrollFromInstanceRequest): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();

    const { acting } = await getKioskSession({ sessionId: request.sessionId });

    if (!acting || !acting.actingMemberId) {
      throw APIError.notFound("Invalid acting token");
    }

    const enrollment = await db.query.lessonInstanceEnrollments.findFirst({
      where: {
        id: request.enrollmentId,
        organizationId,
      },
      with: {
        rider: true,
      },
    });

    if (!enrollment || !enrollment.rider) {
      throw APIError.notFound("Enrollment not found");
    }

    assertKioskActionAllowed({
      action: KioskAction.UNENROLL,
      actingMemberId: acting.actingMemberId,
      scope: acting.scope,
      targetMemberId: enrollment.rider.memberId,
    });

    await lessons.unenrollFromInstance({
      enrollmentId: enrollment.id,
    });
  }
);
