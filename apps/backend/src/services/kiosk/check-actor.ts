import type {
  CheckKioskPermissionRequest,
  CheckKioskPermissionResponse,
  GetKioskActingRiderOptionsResponse,
} from "@instride/api/contracts";
import { KioskScope } from "@instride/shared";
import { api } from "encore.dev/api";

import { memberRepo } from "@/services/organizations/members/member.repo";
import { requireOrganizationAuth } from "@/shared/auth";
import { toISOOrNull } from "@/shared/utils/mappers";

import { resolveKioskActor } from "./actor";
import { kioskRepo } from "./kiosk.repo";
import { assertActiveActing } from "./permissions";
import { loadRiderOptionsForMember } from "./rider-options";

export const checkKioskPermission = api(
  {
    method: "POST",
    path: "/kiosk/check-permission",
    expose: true,
    auth: true,
  },
  async (
    request: CheckKioskPermissionRequest
  ): Promise<CheckKioskPermissionResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const session = await kioskRepo.findOne(request.sessionId, organizationId);

    // verification is required for this endpoint — it's the whole point.
    // For already-acting users, the client uses cached permissions and
    // calls getKioskActingRiderOptions instead.
    const actor = await resolveKioskActor({
      sessionId: session.id,
      organizationId,
      verification: request.verification,
      context: request.context,
    });

    const member = await memberRepo.findOne(actor.memberId, organizationId);
    const riderOptions = await loadRiderOptionsForMember({
      organizationId,
      member,
      boardId: session.boardId,
    });

    return { member, riderOptions };
  }
);

export const getKioskActingRiderOptions = api(
  {
    method: "GET",
    path: "/kiosk/sessions/:sessionId/acting-rider-options",
    expose: true,
    auth: true,
  },
  async ({
    sessionId,
  }: {
    sessionId: string;
  }): Promise<GetKioskActingRiderOptionsResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const session = await kioskRepo.findOne(sessionId, organizationId);

    if (!session.actingMemberId || session.scope === KioskScope.DEFAULT) {
      return { riderOptions: [] };
    }

    assertActiveActing({
      actingMemberId: session.actingMemberId,
      scope: session.scope,
      expiresAt: toISOOrNull(session.expiresAt),
    });

    const member = await memberRepo.findOne(
      session.actingMemberId,
      organizationId
    );

    const riderOptions = await loadRiderOptionsForMember({
      organizationId,
      member,
      boardId: session.boardId,
    });

    return { riderOptions };
  }
);
