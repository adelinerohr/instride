import type {
  CanAccessOrganizationResponse,
  GetGuardianRelationshipResponse,
  ListGuardianRelationshipsResponse,
  ListMyDependentsResponse,
  ListMyGuardiansResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { requireAuth, requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import { guardianRepo } from "./guardian.repo";
import {
  toGuardianRelationshipWithGuardian,
  toGuardianRelationshipWithMembers,
  toMyDependent,
} from "./mappers";

export const getRelationshipById = api(
  {
    method: "GET",
    path: "/guardians/:relationshipId",
    expose: true,
    auth: true,
  },
  async ({
    relationshipId,
  }: {
    relationshipId: string;
  }): Promise<GetGuardianRelationshipResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const row = await guardianRepo.findRelationshipWithMembers(
      relationshipId,
      organizationId
    );

    return { relationship: toGuardianRelationshipWithMembers(row) };
  }
);

export const listAllRelationships = api(
  { method: "GET", path: "/guardians", expose: true, auth: true },
  async (): Promise<ListGuardianRelationshipsResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const rows =
      await guardianRepo.listRelationshipsWithMembers(organizationId);

    return {
      relationships: rows.map(toGuardianRelationshipWithMembers),
    };
  }
);

export const listMyDependents = api(
  {
    method: "GET",
    path: "/guardians/my-dependents",
    expose: true,
    auth: true,
  },
  async (): Promise<ListMyDependentsResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const rows = await guardianRepo.listMyDependents({
      guardianMemberId: member.id,
      organizationId,
    });

    return { relationships: rows.map(toMyDependent) };
  }
);

export const listMyGuardians = api(
  {
    method: "GET",
    path: "/guardians/my-guardians",
    expose: true,
    auth: true,
  },
  async (): Promise<ListMyGuardiansResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const rows = await guardianRepo.listMyGuardians({
      dependentMemberId: member.id,
      organizationId,
    });

    return {
      relationships: rows.map(toGuardianRelationshipWithGuardian),
    };
  }
);

/**
 * Whether the current user can access a given organization.
 * Restricted-rider members need an active guardian relationship.
 */
export const canAccessOrganization = api(
  {
    method: "GET",
    path: "/organizations/:organizationId/can-access",
    expose: true,
    auth: true,
  },
  async ({
    organizationId,
  }: {
    organizationId: string;
  }): Promise<CanAccessOrganizationResponse> => {
    const { userID } = requireAuth();

    const member = await db.query.members.findFirst({
      where: { userId: userID, organizationId },
      with: { rider: true },
    });
    assertExists(member, "Member not found");
    assertExists(member.rider, "Rider not found");

    if (member.isPlaceholder) {
      return {
        canAccess: false,
        reason: "Please accept your guardian invitation first",
      };
    }

    if (member.rider.isRestricted) {
      const relationship = await guardianRepo.findActiveForDependent({
        dependentMemberId: member.id,
      });

      if (!relationship) {
        return {
          canAccess: false,
          reason: "No active guardian relationship found",
        };
      }
    }

    return { canAccess: true };
  }
);
