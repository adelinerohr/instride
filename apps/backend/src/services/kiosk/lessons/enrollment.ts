import type {
  EnrollInInstanceResponse,
  KioskEnrollInInstanceRequest,
  KioskUnenrollFromInstanceRequest,
} from "@instride/api/contracts";
import { KioskAction } from "@instride/shared";
import { api, APIError } from "encore.dev/api";

import { instanceEnrollmentService } from "@/services/lessons/enrollments/enrollment.service";
import { enrollRidersInInstance } from "@/services/lessons/enrollments/mutations";
import { lessonInstanceService } from "@/services/lessons/instances/instance.service";
import {
  toInstanceEnrollment,
  toLessonInstance,
} from "@/services/lessons/mappers";
import { memberService } from "@/services/organizations/members/member.service";
import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { kioskService } from "../kiosk.service";
import { assertActiveActing, assertKioskActionAllowed } from "../permissions";
import { assertKioskBookingRules } from "./validation";

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

    // Resolve target rider from member id
    const rider = await memberService.findOneRider(
      request.riderMemberId,
      organizationId
    );

    assertKioskActionAllowed({
      action: KioskAction.ENROLL,
      actingMemberId: acting.actingMemberId,
      scope: acting.scope,
      targetMemberId: request.riderMemberId,
    });

    const instance = await lessonInstanceService
      .findOneExpanded(request.instanceId, organizationId)
      .then(toLessonInstance);

    const { canBook, reason } = await assertKioskBookingRules({
      rider,
      instance,
      scope: acting.scope,
    });
    if (!canBook) {
      throw APIError.permissionDenied(reason?.message || "Cannot book lesson");
    }

    // Direct call into the lessons service — no HTTP round-trip
    await enrollRidersInInstance({
      organizationId,
      instanceId: request.instanceId,
      riderIds: [rider.id],
      enrolledByMemberId: acting.actingMemberId,
      idempotent: false,
    });

    const enrollments = await instanceEnrollmentService.findManyForRiders({
      organizationId,
      riderIds: [rider.id],
    });

    return { enrollments: enrollments.map(toInstanceEnrollment) };
  }
);

export const kioskUnenrollFromInstance = api(
  {
    method: "POST",
    path: "/kiosk/lessons/enrollments/:enrollmentId/unenroll",
    expose: true,
    auth: true,
  },
  async (request: KioskUnenrollFromInstanceRequest): Promise<void> => {
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
      action: KioskAction.UNENROLL,
      actingMemberId: acting.actingMemberId,
      scope: acting.scope,
      targetMemberId: enrollment.rider.memberId,
    });

    await instanceEnrollmentService.unenroll({
      enrollmentId: enrollment.id,
      organizationId,
      unenrolledByMemberId: acting.actingMemberId,
    });
  }
);
