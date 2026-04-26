import type {
  ClearKioskIdentityRequest,
  KioskSessionResponse,
  VerifyKioskIdentityRequest,
} from "@instride/api/contracts";
import { KioskScope, MembershipRole } from "@instride/shared";
import { addHours } from "date-fns";
import { api, APIError } from "encore.dev/api";

import { verifyKioskPin } from "@/services/organizations/members/pin";
import { requireOrganizationAuth } from "@/shared/auth";

import { kioskService } from "./kiosk.service";

const KIOSK_SESSION_DURATION_HOURS = 1;

export const verifyKioskIdentity = api(
  { method: "POST", path: "/kiosk/verify", expose: true, auth: true },
  async (
    request: VerifyKioskIdentityRequest
  ): Promise<KioskSessionResponse> => {
    const { organizationId } = requireOrganizationAuth();

    // Confirm session exists and belongs to this org
    await kioskService.findOneScalar(request.sessionId, organizationId);

    const verification = await verifyKioskPin({
      pin: request.pin,
      organizationId,
      memberId: request.memberId,
    });

    if (!verification.member.kioskPin) {
      throw APIError.failedPrecondition("Member has not set a PIN");
    }
    if (!verification.ok) {
      throw APIError.permissionDenied("Invalid PIN");
    }

    const member = verification.member;

    const isStaff =
      member.roles.includes(MembershipRole.ADMIN) ||
      member.roles.includes(MembershipRole.TRAINER);
    const scope = isStaff ? KioskScope.STAFF : KioskScope.SELF;

    // Set expiry so subsequent operations (like markAttendance) can enforce it.
    // Without this, sessions silently never expire and expiry checks always fail.
    const expiresAt = addHours(new Date(), KIOSK_SESSION_DURATION_HOURS);

    const updated = await kioskService.setActing({
      id: request.sessionId,
      organizationId,
      actingMemberId: member.id,
      scope,
      expiresAt,
    });

    return {
      acting: {
        actingMemberId: member.id,
        scope,
        expiresAt: updated.expiresAt?.toISOString() ?? null,
      },
    };
  }
);

export const clearKioskIdentity = api(
  { method: "POST", path: "/kiosk/clear", expose: true, auth: true },
  async (request: ClearKioskIdentityRequest): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();
    await kioskService.clearActing(request.sessionId, organizationId);
  }
);
