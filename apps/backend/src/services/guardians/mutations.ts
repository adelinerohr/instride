import { GuardianRelationshipStatus } from "@instride/shared";
import { and, eq } from "drizzle-orm";
import { api } from "encore.dev/api";

import { guardianRelationships } from "@/database/schema";
import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import {
  defaultPermissions,
  GuardianPermissions,
  GuardianRelationship,
} from "./types/models";

interface UpdateGuardianRelationshipRequest {
  relationshipId: string;
  guardianMemberId?: string;
  dependentMemberId?: string;
  status?: GuardianRelationshipStatus;
  permissions?: Partial<GuardianPermissions>;
  coppaConsentGiven?: boolean;
  coppaConsentGivenAt?: string | null;
}

export const updateGuardianRelationship = api(
  {
    method: "POST",
    path: "/guardians/:relationshipId/update",
    expose: true,
    auth: true,
  },
  async (
    request: UpdateGuardianRelationshipRequest
  ): Promise<GuardianRelationship> => {
    const { organizationId } = requireOrganizationAuth();

    const permissions = request.permissions
      ? {
          ...defaultPermissions,
          ...request.permissions,
        }
      : defaultPermissions;

    const [relationship] = await db
      .update(guardianRelationships)
      .set({
        ...request,
        permissions,
        coppaConsentGivenAt: request.coppaConsentGivenAt
          ? new Date(request.coppaConsentGivenAt)
          : undefined,
      })
      .where(
        and(
          eq(guardianRelationships.id, request.relationshipId),
          eq(guardianRelationships.organizationId, organizationId)
        )
      )
      .returning();

    assertExists(relationship, "Guardian relationship not found");

    return relationship;
  }
);

export const revokeRelationship = api(
  {
    method: "POST",
    path: "/guardians/:relationshipId/revoke",
    expose: true,
    auth: true,
  },
  async (params: { relationshipId: string }): Promise<GuardianRelationship> => {
    const { organizationId } = requireOrganizationAuth();

    const [relationship] = await db
      .update(guardianRelationships)
      .set({
        status: GuardianRelationshipStatus.REVOKED,
        revokedAt: new Date(),
      })
      .where(
        and(
          eq(guardianRelationships.id, params.relationshipId),
          eq(guardianRelationships.organizationId, organizationId)
        )
      )
      .returning();

    assertExists(relationship, "Guardian relationship not found");

    return relationship;
  }
);

export const acceptRelationship = api(
  {
    method: "POST",
    path: "/guardians/:relationshipId/accept",
    expose: true,
    auth: true,
  },
  async (params: { relationshipId: string }): Promise<GuardianRelationship> => {
    const { organizationId } = requireOrganizationAuth();

    const [relationship] = await db
      .update(guardianRelationships)
      .set({ status: GuardianRelationshipStatus.ACTIVE, revokedAt: null })
      .where(
        and(
          eq(guardianRelationships.id, params.relationshipId),
          eq(guardianRelationships.organizationId, organizationId)
        )
      )
      .returning();

    assertExists(relationship, "Guardian relationship not found");

    return relationship;
  }
);
