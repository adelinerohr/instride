import type {
  CreateOrganizationRequest,
  GetOrganizationResponse,
  UpdateOrganizationRequest,
} from "@instride/api/contracts";
import { MembershipRole } from "@instride/shared";
import { api, APIError } from "encore.dev/api";

import { auth } from "@/services/auth/auth";
import { assertAdmin } from "@/services/auth/gates";
import { requireAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { toOrganization } from "./mappers";
import { memberService } from "./members/member.service";
import { organizationService } from "./organization.service";

export const createOrganization = api(
  { expose: true, method: "POST", path: "/organizations", auth: true },
  async (
    request: CreateOrganizationRequest
  ): Promise<GetOrganizationResponse> => {
    const { userID } = requireAuth();

    const existing = await organizationService.findOneBySlug(request.slug);
    if (existing) {
      throw APIError.alreadyExists(`Slug "${request.slug}" is already taken`);
    }

    const authOrg = await auth.api.createOrganization({
      body: {
        name: request.name,
        slug: request.slug,
        timezone: request.timezone,
        userId: userID,
      },
    });
    assertExists(authOrg, "Failed to create organization in auth");

    const organization = await organizationService.create({
      ...request,
      authOrganizationId: authOrg.id,
    });

    assertExists(
      authOrg.members,
      "Better Auth did not return owner membership"
    );

    const authMemberRow = authOrg.members[0];
    if (authMemberRow) {
      await memberService.create({
        userId: userID,
        organizationId: organization.id,
        authMemberId: authMemberRow.id,
        roles: [MembershipRole.ADMIN],
        onboardingComplete: false,
      });
    }

    return { organization: toOrganization(organization) };
  }
);

export const updateOrganization = api(
  {
    expose: true,
    method: "PUT",
    path: "/organizations/:organizationId",
    auth: true,
  },
  async (
    request: UpdateOrganizationRequest
  ): Promise<GetOrganizationResponse> => {
    const { userID } = requireAuth();
    const { organizationId, ...data } = request;

    await assertAdmin(organizationId, userID);

    const updated = await organizationService.update(organizationId, data);
    return { organization: toOrganization(updated) };
  }
);
