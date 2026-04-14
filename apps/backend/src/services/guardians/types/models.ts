import { Member } from "@/services/organizations/types/models";

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
  dependent?: Member | null;
}
