import type {
  GetInstanceEnrollmentResponse,
  MarkAttendanceRequest,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";

import { toInstanceEnrollment } from "../mappers";
import { instanceEnrollmentRepo } from "./enrollment.repo";

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

    await instanceEnrollmentRepo.markAttendance(
      request.enrollmentId,
      organizationId,
      {
        markedByMemberId: member.id,
        attended: request.attended,
      }
    );

    // Re-fetch with rider so the response matches the contract
    const full = await instanceEnrollmentRepo.findOne(
      request.enrollmentId,
      organizationId
    );
    return { enrollment: toInstanceEnrollment(full) };
  }
);
