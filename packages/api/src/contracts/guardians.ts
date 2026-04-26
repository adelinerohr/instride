import type {
  GuardianRelationshipStatus,
  InvitationStatus,
} from "@instride/shared";

import type { MemberSummary, Rider } from "./organizations";
import { QuestionnaireQuestionResponse } from "./questionnaires";

// ============================================================================
// Entities
// ============================================================================

export interface GuardianRelationship {
  id: string;
  organizationId: string;
  guardianMemberId: string;
  dependentMemberId: string;
  status: GuardianRelationshipStatus;
  permissions: GuardianPermissions;
  coppaConsentGiven: boolean;
  coppaConsentGivenAt: Date | string | null;
  revokedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface GuardianRelationshipWithMembers extends GuardianRelationship {
  guardian: MemberSummary;
  dependent: MemberSummary;
}

export interface GuardianRelationshipWithGuardian extends GuardianRelationship {
  guardian: MemberSummary;
}

// A guardian's view of a dependent — relationship metadata + the dependent's
// rider profile. The rider object includes member info via the Rider contract.
export interface MyDependent {
  id: string; // relationship id
  dependentMemberId: string;
  permissions: GuardianPermissions;
  status: GuardianRelationshipStatus;
  createdAt: Date | string;
  rider: Rider;
}

export interface GuardianInvitation {
  id: string;
  token: string;
  email: string;
  status: InvitationStatus;
  expiresAt: Date | string;
  createdAt: Date | string;
}

export interface GuardianInvitationWithContext extends GuardianInvitation {
  guardianName: string;
  guardianEmail: string;
  dependentName: string;
  organizationName: string;
  organizationSlug: string;
}

export interface PendingInvitationSummary {
  token: string;
  organizationSlug: string;
}

export interface GuardianPermissions {
  bookings: {
    canBookLessons: boolean;
    canJoinEvents: boolean;
    requiresApproval: boolean;
    canCancel: boolean;
  };
  communication: {
    canPost: boolean;
    canComment: boolean;
    receiveEmailNotifications: boolean;
    receiveTextNotifications: boolean;
  };
  profile: {
    canEdit: boolean;
  };
}

export const defaultPermissions: GuardianPermissions = {
  bookings: {
    canBookLessons: true,
    canJoinEvents: true,
    requiresApproval: true,
    canCancel: true,
  },
  communication: {
    canPost: true,
    canComment: true,
    receiveEmailNotifications: true,
    receiveTextNotifications: true,
  },
  profile: {
    canEdit: true,
  },
};

// ============================================================================
// Requests
// ============================================================================

export interface CreateGuardianRelationshipRequest {
  guardianMemberId: string;
  dependentMemberId: string;
  permissions: Partial<GuardianPermissions>;
  coppaConsentGiven: boolean;
  coppaConsentGivenAt: string | null;
}

export interface UpdateGuardianRelationshipRequest {
  relationshipId: string;
  status?: GuardianRelationshipStatus;
  permissions?: Partial<GuardianPermissions>;
  coppaConsentGiven?: boolean;
  coppaConsentGivenAt?: string | null;
}

export interface SendDependentInvitationRequest {
  relationshipId: string;
  email: string;
}

export interface CreatePlaceholderRelationshipRequest {
  placeholderProfile: {
    name: string;
    email?: string;
    phone?: string | null;
    image?: string | null;
    dateOfBirth: string;
  };
  permissions: Partial<GuardianPermissions>;
  questionnaire?: {
    questionnaireId: string;
    responses: QuestionnaireQuestionResponse[];
  };
  waiver?: {
    waiverId: string;
  };
}

// ============================================================================
// Responses
// ============================================================================

export interface CanAccessOrganizationResponse {
  canAccess: boolean;
  reason?: string;
}

export interface GetGuardianRelationshipResponse {
  relationship: GuardianRelationshipWithMembers;
}

export interface ListGuardianRelationshipsResponse {
  relationships: GuardianRelationshipWithMembers[];
}

export interface ListMyGuardiansResponse {
  relationships: GuardianRelationshipWithGuardian[];
}

export interface GetMyGuardianResponse {
  relationship: GuardianRelationshipWithGuardian;
}

export interface ListMyDependentsResponse {
  relationships: MyDependent[];
}

export interface GetGuardianInvitationResponse {
  invitation: GuardianInvitationWithContext;
}

export interface GetPendingInvitationResponse {
  invitation: PendingInvitationSummary | null;
}

export interface SendDependentInvitationResponse {
  invitation: GuardianInvitation;
}

export interface MutateGuardianRelationshipResponse {
  relationship: GuardianRelationship;
}
