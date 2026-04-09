import { InvitationStatus } from "../models/enums";
import { MemberWithUser } from "./users";

export interface GuardianRelationship {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  guardianMemberId: string;
  dependentMemberId: string;
  canBookLessons: boolean;
  canPostOnFeed: boolean;
  coppaConsentGiven: boolean;
  coppaConsentGivenAt: Date | string | null;
}

export interface GuardianInvitation {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  email: string;
  token: string;
  status: InvitationStatus;
  relationshipId: string;
  lastSentAt: Date | string | null;
}

export interface GuardianRelationshipWithMembers extends GuardianRelationship {
  guardian: MemberWithUser;
  dependent: MemberWithUser;
}
