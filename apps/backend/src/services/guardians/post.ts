import { GuardianRelationshipStatus } from "@instride/shared";
import { eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";

import { db } from "@/database";
import { guardianRelationships } from "@/database/schema";

import { GetGuardianRelationshipResponse } from "./types/contracts";

interface UpdateGuardianRelationshipRequest {
  relationshipId: string;
  guardianMemberId?: string;
  dependentMemberId?: string;
  status?: GuardianRelationshipStatus;
  canBookLessons?: boolean;
  canPostOnFeed?: boolean;
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
  ): Promise<GetGuardianRelationshipResponse> => {
    const [relationship] = await db
      .update(guardianRelationships)
      .set({
        ...request,
        coppaConsentGivenAt: request.coppaConsentGivenAt
          ? new Date(request.coppaConsentGivenAt)
          : undefined,
      })
      .where(eq(guardianRelationships.id, request.relationshipId))
      .returning();

    if (!relationship)
      throw APIError.notFound("Guardian relationship not found");

    return {
      relationship,
    };
  }
);

export const revokeRelationship = api(
  {
    method: "POST",
    path: "/guardians/:relationshipId/revoke",
    expose: true,
    auth: true,
  },
  async ({ relationshipId }: { relationshipId: string }): Promise<void> => {
    await db
      .update(guardianRelationships)
      .set({ status: "revoked", revokedAt: new Date() })
      .where(eq(guardianRelationships.id, relationshipId));
  }
);

export const confirmRelationship = api(
  {
    method: "POST",
    path: "/guardians/:relationshipId/confirm",
    expose: true,
    auth: true,
  },
  async ({
    relationshipId,
  }: {
    relationshipId: string;
  }): Promise<GetGuardianRelationshipResponse> => {
    const [relationship] = await db
      .update(guardianRelationships)
      .set({ status: GuardianRelationshipStatus.ACTIVE, revokedAt: null })
      .where(eq(guardianRelationships.id, relationshipId))
      .returning();

    if (!relationship)
      throw APIError.notFound("Guardian relationship not found");

    return {
      relationship,
    };
  }
);
