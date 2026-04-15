import { api, APIError } from "encore.dev/api";
import { lessons } from "~encore/clients";

import { db } from "@/database";
import { GetInstanceEnrollmentResponse } from "@/services/lessons/types/contracts";
import { requireOrganizationAuth } from "@/shared/auth";

import { assertKioskActionAllowed } from "../permissions";
import { getKioskSession } from "../sessions";
import { KioskAction } from "../types/models";

interface KioskMarkAttendanceRequest {
  sessionId: string;
  enrollmentId: string;
  attended: boolean;
}

export const kioskMarkAttendance = api(
  {
    method: "POST",
    path: "/kiosk/lessons/enrollments/:enrollmentId/mark-attendance",
    expose: true,
    auth: true,
  },
  async (
    request: KioskMarkAttendanceRequest
  ): Promise<GetInstanceEnrollmentResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const { acting } = await getKioskSession({ sessionId: request.sessionId });

    if (!acting.actingMemberId) {
      throw APIError.permissionDenied("No active kiosk session");
    }

    if (
      !acting.expiresAt ||
      new Date(acting.expiresAt).getTime() < Date.now()
    ) {
      throw APIError.permissionDenied("Kiosk session expired");
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

    if (!enrollment || enrollment.organizationId !== organizationId) {
      throw APIError.notFound("Enrollment not found");
    }

    if (!enrollment.rider) {
      throw APIError.notFound("Rider not found");
    }

    assertKioskActionAllowed({
      action: KioskAction.MARK_ATTENDANCE,
      actingMemberId: acting.actingMemberId,
      scope: acting.scope,
      targetMemberId: enrollment.rider.memberId,
    });

    return await lessons.markAttendance({
      enrollmentId: enrollment.id,
      attended: request.attended,
    });
  }
);
