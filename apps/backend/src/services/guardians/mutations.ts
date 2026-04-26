import {
  defaultPermissions,
  type CreateGuardianRelationshipRequest,
  type GuardianPermissions,
  type MutateGuardianRelationshipResponse,
  type UpdateGuardianRelationshipRequest,
} from "@instride/api/contracts";
import { GuardianRelationshipStatus } from "@instride/shared";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { guardianService } from "./guardian.service";
import { toGuardianRelationship } from "./mappers";

function mergePermissions(
  partial: Partial<GuardianPermissions> | undefined
): GuardianPermissions {
  if (!partial) return defaultPermissions;
  return {
    ...defaultPermissions,
    ...partial,
  };
}

export const createGuardianRelationship = api(
  { method: "POST", path: "/guardians", expose: true, auth: true },
  async (
    request: CreateGuardianRelationshipRequest
  ): Promise<MutateGuardianRelationshipResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const permissions = mergePermissions(request.permissions);

    // Re-activate or update existing relationship if one already exists
    const existing = await guardianService.findRelationshipBetween({
      guardianMemberId: request.guardianMemberId,
      dependentMemberId: request.dependentMemberId,
      organizationId,
    });

    if (existing) {
      const updated = await guardianService.updateRelationship(
        existing.id,
        organizationId,
        {
          permissions,
          coppaConsentGiven: request.coppaConsentGiven,
          coppaConsentGivenAt: request.coppaConsentGivenAt
            ? new Date(request.coppaConsentGivenAt)
            : null,
        }
      );
      return { relationship: toGuardianRelationship(updated) };
    }

    const created = await guardianService.createRelationship({
      organizationId,
      guardianMemberId: request.guardianMemberId,
      dependentMemberId: request.dependentMemberId,
      permissions,
      coppaConsentGiven: request.coppaConsentGiven,
      coppaConsentGivenAt: request.coppaConsentGivenAt
        ? new Date(request.coppaConsentGivenAt)
        : null,
    });

    return { relationship: toGuardianRelationship(created) };
  }
);

export const updateGuardianRelationship = api(
  {
    method: "POST",
    path: "/guardians/:relationshipId/update",
    expose: true,
    auth: true,
  },
  async (
    request: UpdateGuardianRelationshipRequest
  ): Promise<MutateGuardianRelationshipResponse> => {
    const { organizationId } = requireOrganizationAuth();

    // Verify existence + tenant scope
    await guardianService.findRelationshipScalar(
      request.relationshipId,
      organizationId
    );

    const updated = await guardianService.updateRelationship(
      request.relationshipId,
      organizationId,
      {
        ...(request.status !== undefined && { status: request.status }),
        ...(request.permissions !== undefined && {
          permissions: mergePermissions(request.permissions),
        }),
        ...(request.coppaConsentGiven !== undefined && {
          coppaConsentGiven: request.coppaConsentGiven,
        }),
        ...(request.coppaConsentGivenAt !== undefined && {
          coppaConsentGivenAt: request.coppaConsentGivenAt
            ? new Date(request.coppaConsentGivenAt)
            : null,
        }),
      }
    );

    return { relationship: toGuardianRelationship(updated) };
  }
);

export const revokeRelationship = api(
  {
    method: "POST",
    path: "/guardians/:relationshipId/revoke",
    expose: true,
    auth: true,
  },
  async ({
    relationshipId,
  }: {
    relationshipId: string;
  }): Promise<MutateGuardianRelationshipResponse> => {
    const { organizationId } = requireOrganizationAuth();

    // Tenant scope check
    await guardianService.findRelationshipScalar(
      relationshipId,
      organizationId
    );

    const updated = await guardianService.updateRelationship(
      relationshipId,
      organizationId,
      {
        status: GuardianRelationshipStatus.REVOKED,
        revokedAt: new Date(),
      }
    );

    return { relationship: toGuardianRelationship(updated) };
  }
);

export const acceptRelationship = api(
  {
    method: "POST",
    path: "/guardians/:relationshipId/accept",
    expose: true,
    auth: true,
  },
  async ({
    relationshipId,
  }: {
    relationshipId: string;
  }): Promise<MutateGuardianRelationshipResponse> => {
    const { organizationId } = requireOrganizationAuth();

    await guardianService.findRelationshipScalar(
      relationshipId,
      organizationId
    );

    const updated = await guardianService.updateRelationship(
      relationshipId,
      organizationId,
      {
        status: GuardianRelationshipStatus.ACTIVE,
        revokedAt: null,
      }
    );

    return { relationship: toGuardianRelationship(updated) };
  }
);
