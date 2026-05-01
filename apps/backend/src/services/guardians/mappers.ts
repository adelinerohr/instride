import type {
  GuardianInvitation,
  GuardianInvitationWithContext,
  GuardianRelationship,
  GuardianRelationshipWithGuardian,
  GuardianRelationshipWithMembers,
  MyDependent,
} from "@instride/api/contracts";

import { AuthUserRow } from "@/services/auth/schema";
import {
  RiderWithExpansionRow,
  toMemberSummary,
  toRider,
} from "@/services/organizations/mappers";
import { MemberRow } from "@/services/organizations/schema";
import { OrganizationRow } from "@/services/organizations/schema";
import { assertExists } from "@/shared/utils/validation";

import type { GuardianInvitationRow, GuardianRelationshipRow } from "./schema";

type MemberWithAuth = MemberRow & { authUser: AuthUserRow | null };

export function toGuardianRelationship(
  row: GuardianRelationshipRow
): GuardianRelationship {
  return {
    id: row.id,
    organizationId: row.organizationId,
    guardianMemberId: row.guardianMemberId,
    dependentMemberId: row.dependentMemberId,
    status: row.status,
    permissions: row.permissions,
    coppaConsentGiven: row.coppaConsentGiven,
    coppaConsentGivenAt: row.coppaConsentGivenAt,
    revokedAt: row.revokedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toGuardianRelationshipWithMembers(
  row: GuardianRelationshipRow & {
    guardian: MemberWithAuth | null;
    dependent: MemberWithAuth | null;
  }
): GuardianRelationshipWithMembers {
  assertExists(row.guardian, "Relationship has no guardian");
  assertExists(row.dependent, "Relationship has no dependent");

  return {
    ...toGuardianRelationship(row),
    guardian: toMemberSummary(row.guardian),
    dependent: toMemberSummary(row.dependent),
  };
}

export function toGuardianRelationshipWithGuardian(
  row: GuardianRelationshipRow & { guardian: MemberWithAuth | null }
): GuardianRelationshipWithGuardian {
  assertExists(row.guardian, "Relationship has no guardian");
  return {
    ...toGuardianRelationship(row),
    guardian: toMemberSummary(row.guardian),
  };
}

export function toMyDependent(
  row: GuardianRelationshipRow & {
    dependent: (MemberRow & { rider: RiderWithExpansionRow | null }) | null;
  }
): MyDependent {
  assertExists(row.dependent, "Relationship has no dependent");
  assertExists(row.dependent.rider, "Dependent has no rider");

  return {
    id: row.id,
    dependentMemberId: row.dependentMemberId,
    permissions: row.permissions,
    status: row.status,
    createdAt: row.createdAt,
    rider: toRider(row.dependent.rider),
  };
}

export function toGuardianInvitation(
  row: GuardianInvitationRow
): GuardianInvitation {
  return {
    id: row.id,
    token: row.token,
    email: row.email,
    status: row.status,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  };
}

export function toGuardianInvitationWithContext(
  row: GuardianInvitationRow & {
    relationship:
      | (GuardianRelationshipRow & {
          organization: OrganizationRow | null;
          guardian: MemberWithAuth | null;
          dependent: MemberWithAuth | null;
        })
      | null;
  }
): GuardianInvitationWithContext {
  assertExists(row.relationship, "Invitation has no relationship");
  assertExists(
    row.relationship.organization,
    "Relationship has no organization"
  );
  assertExists(row.relationship.guardian, "Relationship has no guardian");
  assertExists(row.relationship.dependent, "Relationship has no dependent");
  assertExists(row.relationship.guardian.authUser, "Guardian has no auth user");
  assertExists(
    row.relationship.dependent.authUser,
    "Dependent has no auth user"
  );

  return {
    ...toGuardianInvitation(row),
    guardianName: row.relationship.guardian.authUser.name,
    guardianEmail: row.relationship.guardian.authUser.email,
    dependentName: row.relationship.dependent.authUser.name,
    organizationName: row.relationship.organization.name,
    organizationSlug: row.relationship.organization.slug,
  };
}
