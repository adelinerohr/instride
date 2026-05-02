import type {
  EnrollInInstanceResponse,
  KioskEnrollInInstanceRequest,
  KioskUnenrollFromInstanceRequest,
} from "@instride/api/contracts";
import { KioskActions, KioskScope } from "@instride/shared";
import { api, APIError } from "encore.dev/api";

import { instanceEnrollmentRepo } from "@/services/lessons/enrollments/enrollment.repo";
import { enrollRidersInInstance } from "@/services/lessons/enrollments/mutations";
import { lessonInstanceRepo } from "@/services/lessons/instances/instance.repo";
import {
  toInstanceEnrollment,
  toLessonInstance,
} from "@/services/lessons/mappers";
import { memberRepo } from "@/services/organizations/members/member.repo";
import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { resolveKioskActor } from "../actor";
import { db } from "../db";
import { assertSelfOrAuthorizedGuardian } from "../permissions";
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

    // Gate-time check: actor exists and (for SELF) has authority over at
    // least one rider. Per-rider check follows below.
    const actor = await resolveKioskActor({
      sessionId: request.sessionId,
      organizationId,
      verification: request.verification,
      context: {
        action: KioskActions.ENROLL,
      },
    });

    // Per-rider check: confirm the actor can act on *this* rider. Staff
    // skip; SELF must be self or an authorized guardian of the target.
    if (actor.scope === KioskScope.SELF) {
      await assertSelfOrAuthorizedGuardian({
        organizationId,
        actingMemberId: actor.memberId,
        targetMemberId: request.riderMemberId,
        permissionKey: "canBookLessons",
      });
    }

    const rider = await memberRepo.findOneRiderByMember(
      request.riderMemberId,
      organizationId
    );

    const instance = await lessonInstanceRepo
      .findOneExpanded(request.instanceId, organizationId)
      .then(toLessonInstance);

    const { canBook, reason } = await assertKioskBookingRules({
      rider,
      instance,
      scope: actor.scope,
    });
    if (!canBook) {
      throw APIError.permissionDenied(reason?.message || "Cannot book lesson");
    }

    await enrollRidersInInstance({
      organizationId,
      instanceId: request.instanceId,
      riderIds: [rider.id],
      enrolledByMemberId: actor.memberId,
      idempotent: false,
    });

    const enrollments = await instanceEnrollmentRepo.findManyForRiders({
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

    // Load enrollment first — we need its rider's memberId for the
    // permission context.
    const enrollment = await db.query.lessonInstanceEnrollments.findFirst({
      where: { id: request.enrollmentId, organizationId },
      with: { rider: true },
    });
    assertExists(enrollment, "Enrollment not found");
    assertExists(enrollment.rider, "Enrollment has no rider");

    const actor = await resolveKioskActor({
      sessionId: request.sessionId,
      organizationId,
      verification: request.verification,
      context: {
        action: KioskActions.UNENROLL,
        targetMemberId: enrollment.rider.memberId,
      },
    });

    await instanceEnrollmentRepo.unenroll({
      enrollmentId: enrollment.id,
      organizationId,
      unenrolledByMemberId: actor.memberId,
    });
  }
);
