import type {
  CheckKioskPermissionRequest,
  CheckKioskPermissionResponse,
} from "@instride/api/contracts";
import { MembershipRole } from "@instride/shared";
import { api } from "encore.dev/api";

import { memberRepo } from "@/services/organizations/members/member.repo";
import { requireOrganizationAuth } from "@/shared/auth";

import { guardianRepo } from "../guardians/guardian.repo";
import { toMyDependent } from "../guardians/mappers";
import { resolveKioskActor } from "./actor";
import { kioskRepo } from "./kiosk.repo";

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
    // If the caller wants to check while already acting, they use the
    // permissions in KioskPermissionSet client-side.
    const actor = await resolveKioskActor({
      sessionId: session.id,
      organizationId,
      verification: request.verification,
      context: request.context,
    });

    const member = await memberRepo.findOne(actor.memberId, organizationId);
    const isStaff =
      member.roles.includes(MembershipRole.ADMIN) ||
      member.roles.includes(MembershipRole.TRAINER);
    const isGuardian = member.roles.includes(MembershipRole.GUARDIAN);

    if (isStaff) {
      if (!session.boardId) {
        const riderOptions = await memberRepo.findManyRiders(organizationId);
        return { member, riderOptions };
      }
    }

    if (isGuardian) {
      const relationships = await guardianRepo
        .listMyDependents({
          guardianMemberId: member.id,
          organizationId,
        })
        .then((rows) => rows.map(toMyDependent));

      const dependentRiders = relationships.map((d) => d.rider);

      if (member.rider) {
        return { member, riderOptions: [member.rider, ...dependentRiders] };
      }

      return { member, riderOptions: dependentRiders };
    }

    if (member.rider) {
      return { member, riderOptions: [member.rider] };
    }

    return { member, riderOptions: [] };
  }
);
