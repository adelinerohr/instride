import type {
  GetInstanceEnrollmentResponse,
  KioskMarkAttendanceRequest,
} from "@instride/api/contracts";
import { KioskActions } from "@instride/shared";
import { api } from "encore.dev/api";

import { instanceEnrollmentRepo } from "@/services/lessons/enrollments/enrollment.repo";
import { toInstanceEnrollment } from "@/services/lessons/mappers";
import { requireOrganizationAuth } from "@/shared/auth";

import { resolveKioskActor } from "../actor";

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

    const actor = await resolveKioskActor({
      sessionId: request.sessionId,
      organizationId,
      verification: request.verification,
      context: {
        action: KioskActions.MARK_ATTENDANCE,
        targetMemberId: request.riderMemberId,
      },
    });

    await instanceEnrollmentRepo.markAttendance(
      request.enrollmentId,
      organizationId,
      { attended: request.attended, markedByMemberId: actor.memberId }
    );

    // Re-fetch with rider for the contract response
    const full = await instanceEnrollmentRepo.findOne(
      request.enrollmentId,
      organizationId
    );
    return { enrollment: toInstanceEnrollment(full) };
  }
);
