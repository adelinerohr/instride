import type {
  GetMemberResponse,
  JoinOrganizationRequest,
} from "@instride/api/contracts";
import { MembershipRole } from "@instride/shared";
import { api, APIError } from "encore.dev/api";

import { auth } from "@/services/auth/auth";
import { requireAuth } from "@/shared/auth";

import { memberService } from "./members/member.service";
import { organizationService } from "./organization.service";

export const joinOrganization = api(
  {
    expose: true,
    method: "POST",
    path: "/organizations/:organizationId/join",
    auth: true,
  },
  async ({
    organizationId,
    roles,
  }: JoinOrganizationRequest): Promise<GetMemberResponse> => {
    const { userID, session } = requireAuth();

    if (!session?.user?.email) {
      throw APIError.permissionDenied(
        "You must be logged in to join an organization"
      );
    }

    const organization = await organizationService.findOne(organizationId);

    if (!organization.allowPublicJoin) {
      throw APIError.permissionDenied(
        "This organization does not allow public join"
      );
    }

    // Idempotent: if already a member, return existing
    const existing = await memberService.findOneByUser(userID, organizationId);
    if (existing) {
      return { member: existing };
    }

    const authMemberRow = await auth.api.addMember({
      body: {
        userId: userID,
        organizationId: organization.authOrganizationId,
        role: "rider",
      },
    });
    if (!authMemberRow) {
      throw APIError.internal("Failed to add member to auth");
    }

    const created = await memberService.create({
      userId: userID,
      organizationId: organization.id,
      authMemberId: authMemberRow.id,
      roles: roles ?? [MembershipRole.RIDER],
    });

    const member = await memberService.findOne(created.id, organizationId);
    return { member };
  }
);
