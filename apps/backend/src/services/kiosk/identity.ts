import { MembershipRole } from "@instride/shared";
import { and, eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import { verifyKioskPin } from "../organizations/members/pin";
import { kioskSessions } from "./schema";
import { KioskSessionResponse } from "./types/contracts";
import { KioskScope } from "./types/models";

interface VerifyKioskIdentityRequest {
  sessionId: string;
  memberId: string;
  pin: string;
}

export const verifyKioskIdentity = api(
  {
    method: "POST",
    path: "/kiosk/verify",
    expose: true,
    auth: true,
  },
  async (
    request: VerifyKioskIdentityRequest
  ): Promise<KioskSessionResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const session = await db.query.kioskSessions.findFirst({
      where: {
        id: request.sessionId,
        organizationId,
      },
    });

    if (!session) {
      throw APIError.notFound("Session not found");
    }

    // Verify the PIN
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

    // Determine the scope of the session
    const isStaff =
      member.roles.includes(MembershipRole.ADMIN) ||
      member.roles.includes(MembershipRole.TRAINER);

    const scope = isStaff ? KioskScope.STAFF : KioskScope.SELF;

    // Update the session
    const [updated] = await db
      .update(kioskSessions)
      .set({
        actingMemberId: member.id,
        scope,
      })
      .where(
        and(
          eq(kioskSessions.id, session.id),
          eq(kioskSessions.organizationId, organizationId)
        )
      )
      .returning();

    return {
      acting: {
        actingMemberId: member.id,
        scope,
        expiresAt: updated.expiresAt?.toISOString() ?? null,
      },
    };
  }
);

interface ClearKioskIdentityRequest {
  sessionId: string;
}

export const clearKioskIdentity = api(
  {
    method: "POST",
    path: "/kiosk/clear",
    expose: true,
    auth: true,
  },
  async (request: ClearKioskIdentityRequest): Promise<void> => {
    const { organizationId } = requireOrganizationAuth();

    await db
      .update(kioskSessions)
      .set({
        actingMemberId: null,
        scope: KioskScope.DEFAULT,
        expiresAt: null,
      })
      .where(
        and(
          eq(kioskSessions.id, request.sessionId),
          eq(kioskSessions.organizationId, organizationId)
        )
      );
  }
);
