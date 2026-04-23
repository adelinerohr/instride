import {
  GuardianRelationshipStatus,
  InvitationStatus,
} from "@instride/shared/models/enums";

import { Member, MemberWithRider } from "@/services/organizations/types/models";

export interface GuardianRelationship {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  guardianMemberId: string;
  dependentMemberId: string;
  status: GuardianRelationshipStatus;
  permissions: GuardianPermissions | null;
  coppaConsentGiven: boolean;
  coppaConsentGivenAt: Date | string | null;
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

export interface GuardianInvitation {
  id: string;
  token: string;
  email: string;
  status: InvitationStatus;
  expiresAt: string;
  guardianName: string;
  guardianEmail: string;
  dependentName: string;
  organizationName: string;
  organizationSlug: string;
}

export interface GuardianRelationshipWithDependent extends GuardianRelationship {
  dependent: MemberWithRider;
}

export interface GuardianRelationshipWithGuardian extends GuardianRelationship {
  guardian: Member;
}

export interface GuardianRelationshipWithMembers extends GuardianRelationship {
  guardian: Member;
  dependent: Member;
}
