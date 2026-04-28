import type {
  GetInstanceEnrollmentResponse,
  KioskMarkAttendanceRequest,
} from "@instride/api/contracts";
import { KioskAction } from "@instride/shared";
import { api } from "encore.dev/api";

import { instanceEnrollmentRepo } from "@/services/lessons/enrollments/enrollment.repo";
import { toInstanceEnrollment } from "@/services/lessons/mappers";
import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { kioskService } from "../kiosk.service";
import { assertActiveActing, assertKioskActionAllowed } from "../permissions";

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

    const session = await kioskService.findOne(
      request.sessionId,
      organizationId
    );
    const acting = {
      actingMemberId: session.actingMemberId,
      scope: session.scope,
      expiresAt: session.expiresAt,
    };
    assertActiveActing(acting);

    const enrollment = await db.query.lessonInstanceEnrollments.findFirst({
      where: { id: request.enrollmentId, organizationId },
      with: { rider: true },
    });
    assertExists(enrollment, "Enrollment not found");
    assertExists(enrollment.rider, "Enrollment has no rider");

    assertKioskActionAllowed({
      action: KioskAction.MARK_ATTENDANCE,
      actingMemberId: acting.actingMemberId,
      scope: acting.scope,
      targetMemberId: enrollment.rider.memberId,
    });

    await instanceEnrollmentRepo.markAttendance(
      request.enrollmentId,
      organizationId,
      { attended: request.attended, markedByMemberId: acting.actingMemberId }
    );

    // Re-fetch with rider for the contract response
    const full = await instanceEnrollmentRepo.findOne(
      request.enrollmentId,
      organizationId
    );
    return { enrollment: toInstanceEnrollment(full) };
  }
);
