import { GuardianRelationshipStatus, InvitationStatus } from "@instride/shared";
import { and, eq } from "drizzle-orm";

import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import {
  invitationWithContextExpansion,
  myDependentExpansion,
  relationshipWithGuardianExpansion,
  relationshipWithMembersExpansion,
} from "./fragments";
import {
  guardianInvitations,
  guardianRelationships,
  type GuardianRelationshipRow,
  type NewGuardianInvitationRow,
  type NewGuardianRelationshipRow,
} from "./schema";

export const createGuardianRepo = (client: Database | Transaction = db) => ({
  // ============================================================================
  // Relationships
  // ============================================================================

  createRelationship: async (data: NewGuardianRelationshipRow) => {
    const [relationship] = await client
      .insert(guardianRelationships)
      .values(data)
      .returning();
    assertExists(relationship, "Failed to create guardian relationship");
    return relationship;
  },

  findRelationshipsByDependent: async (
    dependentMemberId: string,
    organizationId: string
  ) => {
    return await client.query.guardianRelationships.findMany({
      where: { dependentMemberId, organizationId },
    });
  },

  findRelationshipScalar: async (id: string, organizationId: string) => {
    const relationship = await client.query.guardianRelationships.findFirst({
      where: { id, organizationId },
    });
    assertExists(relationship, "Guardian relationship not found");
    return relationship;
  },

  findRelationshipBetween: async (params: {
    guardianMemberId: string;
    dependentMemberId: string;
    organizationId: string;
  }) => {
    return await client.query.guardianRelationships.findFirst({
      where: {
        guardianMemberId: params.guardianMemberId,
        dependentMemberId: params.dependentMemberId,
        organizationId: params.organizationId,
      },
    });
  },

  findRelationshipWithMembers: async (id: string, organizationId: string) => {
    const relationship = await client.query.guardianRelationships.findFirst({
      where: { id, organizationId },
      with: relationshipWithMembersExpansion,
    });
    assertExists(relationship, "Guardian relationship not found");
    return relationship;
  },

  listRelationshipsWithMembers: async (organizationId: string) => {
    return await client.query.guardianRelationships.findMany({
      where: { organizationId },
      with: relationshipWithMembersExpansion,
    });
  },

  listMyDependents: async (params: {
    guardianMemberId: string;
    organizationId: string;
  }) => {
    return await client.query.guardianRelationships.findMany({
      where: {
        guardianMemberId: params.guardianMemberId,
        organizationId: params.organizationId,
      },
      with: myDependentExpansion,
    });
  },

  /**
   * Returns ALL relationships where the given member is a dependent.
   * A dependent can have multiple guardians (e.g., divorced parents).
   */
  listMyGuardians: async (params: {
    dependentMemberId: string;
    organizationId: string;
  }) => {
    return await client.query.guardianRelationships.findMany({
      where: {
        dependentMemberId: params.dependentMemberId,
        organizationId: params.organizationId,
      },
      with: relationshipWithGuardianExpansion,
    });
  },

  updateRelationship: async (
    id: string,
    organizationId: string,
    data: Partial<GuardianRelationshipRow>
  ) => {
    const [relationship] = await client
      .update(guardianRelationships)
      .set(data)
      .where(
        and(
          eq(guardianRelationships.id, id),
          eq(guardianRelationships.organizationId, organizationId)
        )
      )
      .returning();
    assertExists(relationship, "Guardian relationship not found");
    return relationship;
  },

  /**
   * Find an active relationship for a dependent. Used by access checks.
   */
  findActiveForDependent: async (params: {
    dependentMemberId: string;
    organizationId?: string;
  }) => {
    return await client.query.guardianRelationships.findFirst({
      where: {
        dependentMemberId: params.dependentMemberId,
        status: GuardianRelationshipStatus.ACTIVE,
        ...(params.organizationId && { organizationId: params.organizationId }),
      },
    });
  },

  // ============================================================================
  // Invitations
  // ============================================================================

  upsertInvitation: async (data: NewGuardianInvitationRow) => {
    const normalizedEmail = data.email.toLowerCase();
    const [invitation] = await client
      .insert(guardianInvitations)
      .values({ ...data, email: normalizedEmail })
      .onConflictDoUpdate({
        target: [guardianInvitations.relationshipId, guardianInvitations.email],
        set: {
          token: data.token,
          expiresAt: data.expiresAt,
          status: InvitationStatus.PENDING,
          email: normalizedEmail,
        },
      })
      .returning();
    assertExists(invitation, "Failed to upsert invitation");
    return invitation;
  },

  findPendingInvitationForEmail: async (email: string) => {
    return await client.query.guardianInvitations.findFirst({
      where: {
        email: email.toLowerCase(),
        status: InvitationStatus.PENDING,
      },
      with: {
        relationship: {
          with: { organization: true },
        },
      },
    });
  },

  findInvitationByToken: async (token: string) => {
    return await client.query.guardianInvitations.findFirst({
      where: { token },
      with: invitationWithContextExpansion,
    });
  },

  findInvitationScalar: async (token: string) => {
    return await client.query.guardianInvitations.findFirst({
      where: { token },
      with: { relationship: true },
    });
  },

  markInvitationAccepted: async (id: string) => {
    await client
      .update(guardianInvitations)
      .set({
        status: InvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
      })
      .where(eq(guardianInvitations.id, id));
  },
});

export const guardianRepo = createGuardianRepo();
