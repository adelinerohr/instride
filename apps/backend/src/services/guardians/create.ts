import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import { updateGuardianRelationship } from "./mutations";
import { guardianRelationships } from "./schema";
import {
  defaultPermissions,
  GuardianPermissions,
  GuardianRelationship,
} from "./types/models";

interface CreateGuardianRelationshipParams {
  guardianMemberId: string;
  dependentMemberId: string;
  permissions: Partial<GuardianPermissions>;
  coppaConsentGiven: boolean;
  coppaConsentGivenAt: string | null;
}

export const createGuardianRelationship = api(
  {
    method: "POST",
    path: "/guardians",
    expose: true,
    auth: true,
  },
  async (
    params: CreateGuardianRelationshipParams
  ): Promise<GuardianRelationship> => {
    const { organizationId } = requireOrganizationAuth();

    const existing = await db.query.guardianRelationships.findFirst({
      where: {
        guardianMemberId: params.guardianMemberId,
        dependentMemberId: params.dependentMemberId,
        organizationId,
      },
    });

    const permissions = params.permissions
      ? {
          ...defaultPermissions,
          ...params.permissions,
        }
      : defaultPermissions;

    if (existing) {
      return await updateGuardianRelationship({
        ...params,
        relationshipId: existing.id,
        permissions,
      });
    }

    const [relationship] = await db
      .insert(guardianRelationships)
      .values({
        ...params,
        organizationId,
        permissions,
        coppaConsentGivenAt: params.coppaConsentGivenAt
          ? new Date(params.coppaConsentGivenAt)
          : null,
      })
      .returning();

    assertExists(relationship, "Failed to create guardian relationship");

    return relationship;
  }
);
