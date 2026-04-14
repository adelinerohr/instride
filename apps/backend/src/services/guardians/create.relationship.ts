import { api, APIError } from "encore.dev/api";

import { db } from "@/database";
import { guardianRelationships } from "@/database/schema";

import { GetGuardianRelationshipResponse } from "./types/contracts";

interface CreateGuardianRelationshipRequest {
  organizationId: string; // Path parameter
  /** Request body */
  guardianMemberId: string;
  dependentMemberId: string;
  canBookLessons: boolean;
  canPostOnFeed: boolean;
  coppaConsentGiven: boolean;
  coppaConsentGivenAt: string | null;
}

export const createGuardianRelationship = api(
  {
    method: "POST",
    path: "/organizations/:organizationId/guardians",
    expose: true,
    auth: true,
  },
  async (
    request: CreateGuardianRelationshipRequest
  ): Promise<GetGuardianRelationshipResponse> => {
    const existing = await db.query.guardianRelationships.findFirst({
      where: {
        guardianMemberId: request.guardianMemberId,
        dependentMemberId: request.dependentMemberId,
      },
    });

    if (existing) {
      throw APIError.alreadyExists("Guardian relationship already exists");
    }

    const [relationship] = await db
      .insert(guardianRelationships)
      .values({
        ...request,
        organizationId: request.organizationId,
        coppaConsentGivenAt: request.coppaConsentGivenAt
          ? new Date(request.coppaConsentGivenAt)
          : null,
      })
      .returning();

    return {
      relationship,
    };
  }
);
