import { randomUUID } from "node:crypto";

import { MembershipRole } from "@instride/shared";
import { isAPIError } from "better-auth/api";
import { api, APIError } from "encore.dev/api";
import { guardians } from "~encore/clients";

import { db } from "@/database";
import { members, riders } from "@/services/organizations/schema";
import { requireAuth } from "@/shared/auth";

import { auth } from "../auth/auth";
import { GetGuardianRelationshipResponse } from "./types/contracts";

interface CreatePlaceholderRelationshipRequest {
  /** Path parameter */
  organizationId: string;
  /** Request body */
  placeholderProfile: {
    name: string;
    email?: string;
    phone?: string | null;
    image?: string | null;
  };
  dependentControls: {
    canBookLessons: boolean;
    canPostOnFeed: boolean;
  };
}

export const createPlaceholderRelationship = api(
  {
    method: "POST",
    path: "/organizations/:organizationId/guardians/placeholder",
    expose: true,
    auth: true,
  },
  async (
    request: CreatePlaceholderRelationshipRequest
  ): Promise<GetGuardianRelationshipResponse> => {
    const { userID } = requireAuth();

    const { placeholderProfile, dependentControls } = request;

    const organization = await db.query.organizations.findFirst({
      where: { id: request.organizationId },
    });
    if (!organization) {
      throw APIError.notFound("Organization not found");
    }

    const email = `dependent+${randomUUID()}@placeholder.instride.local`;
    let authMemberId: string = "";
    let userId: string = "";

    try {
      const { user } = await auth.api.createUser({
        body: {
          email: placeholderProfile.email ?? email,
          name: placeholderProfile.name,
          role: "user",
        },
      });
      userId = user.id;

      await auth.api.updateUser({
        query: {
          id: user.id,
        },
        body: {
          phone: placeholderProfile.phone,
          image: placeholderProfile.image,
        },
      });

      const authMemberRow = await auth.api.addMember({
        body: {
          userId: user.id,
          organizationId: organization.authOrganizationId,
          role: "rider",
        },
      });

      authMemberId = authMemberRow.id;
    } catch (error) {
      if (isAPIError(error)) {
        throw APIError.internal(error.message, error);
      }
    }

    // Create placeholder member
    const [membership] = await db
      .insert(members)
      .values({
        userId,
        organizationId: organization.id,
        authMemberId,
        roles: [MembershipRole.RIDER],
        isPlaceholder: true,
      })
      .returning();

    // Create rider profile for the dependent
    await db
      .insert(riders)
      .values({
        memberId: membership.id,
        organizationId: organization.id,
      })
      .returning();

    const relationship = await guardians.createGuardianRelationship({
      organizationId: organization.id,
      guardianMemberId: userID,
      dependentMemberId: membership.id,
      canBookLessons: dependentControls.canBookLessons,
      canPostOnFeed: dependentControls.canPostOnFeed,
      coppaConsentGiven: false,
      coppaConsentGivenAt: new Date().toISOString(),
    });

    return relationship;
  }
);
