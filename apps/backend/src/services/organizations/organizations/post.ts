import { MembershipRole } from "@instride/shared";
import { eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";

import { db } from "@/database";
import { auth } from "@/services/auth/auth";
import { requireAuth } from "@/shared/auth";

import { members, organizations } from "../schema";
import { GetOrganizationResponse } from "../types/contracts";
import { Member } from "../types/models";

interface CreateOrganizationRequest {
  slug: string;
  name: string;
  phone?: string | null;
  timezone: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  allowSameDayBookings?: boolean;
  allowPublicJoin?: boolean;
}

export interface CreateOrganizationResponse extends GetOrganizationResponse {
  membership: Member;
}

export const createOrganization = api(
  {
    expose: true,
    method: "POST",
    path: "/organizations",
    auth: true,
  },
  async (
    request: CreateOrganizationRequest
  ): Promise<CreateOrganizationResponse> => {
    const { userID } = requireAuth();

    const existing = await db.query.organizations.findFirst({
      where: { slug: request.slug },
    });

    // 1. Check if the slug is already taken
    if (existing) {
      throw APIError.alreadyExists(`Slug "${request.slug}" is already taken`);
    }

    // 2. Create the organization in Better Auth (also creates the owner member)
    const authOrg = await auth.api.createOrganization({
      body: {
        name: request.name,
        slug: request.slug,
        timezone: request.timezone,
        userId: userID,
      },
    });

    if (!authOrg) {
      throw APIError.internal("Failed to create organization");
    }

    // 3. Create internal organization record
    const [organization] = await db
      .insert(organizations)
      .values({
        name: request.name,
        slug: request.slug,
        timezone: request.timezone,
        authOrganizationId: authOrg.id,
      })
      .returning();

    // 4. Create internal membership record
    const authMemberRow = authOrg.members?.[0];
    if (authMemberRow) {
      await db.insert(members).values({
        userId: userID,
        organizationId: organization.id,
        authMemberId: authMemberRow.id,
        roles: [MembershipRole.ADMIN],
        onboardingComplete: false,
      });
    }

    // 5. Get the membership record
    const membership = await db.query.members.findFirst({
      where: {
        userId: userID,
        organizationId: organization.id,
      },
    });

    if (!membership) {
      throw APIError.internal("Failed to create membership");
    }

    return { organization, membership };
  }
);

interface UpdateOrganizationRequest extends Partial<CreateOrganizationRequest> {
  organizationId: string;
}

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
    const { organizationId, ...data } = request;

    const existing = await db.query.organizations.findFirst({
      where: { id: organizationId },
    });

    if (!existing) {
      throw APIError.notFound(`Organization not found`);
    }

    const [updated] = await db
      .update(organizations)
      .set({
        name: data.name,
        timezone: data.timezone,
        logoUrl: data.logoUrl,
        phone: data.phone,
        website: data.website,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
      })
      .where(eq(organizations.id, organizationId))
      .returning();

    return { organization: updated };
  }
);
