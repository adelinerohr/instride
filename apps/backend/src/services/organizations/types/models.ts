import { MembershipRole } from "@instride/shared";

import { AuthUser } from "@/services/auth/types/models";
import { BoardAssignment } from "@/services/boards/types/models";

export interface Organization {
  id: string;
  name: string;
  phone: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  slug: string;
  timezone: string;
  authOrganizationId: string;
  logoUrl: string | null;
  primaryColor: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  tiktok: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  allowSameDayBookings: boolean;
  allowPublicJoin: boolean;
}

export interface Member {
  organizationId: string;
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
  authMemberId: string;
  isPlaceholder: boolean;
  roles: MembershipRole[];
  onboardingComplete: boolean;
  deletedAt: Date | string | null;
  authUser?: AuthUser | null;
  rider?: Rider | null;
  trainer?: Trainer | null;
}

export interface Rider {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  deletedAt: Date | string | null;
  memberId: string;
  isRestricted: boolean;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  ridingLevelId: string | null;
  member?: Member | null;
  boardAssignments?: BoardAssignment[] | null;
  level?: Level | null;
}

export interface Trainer {
  organizationId: string;
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
  memberId: string;
  bio: string | null;
  member?: Member | null;
  boardAssignments?: BoardAssignment[] | null;
}

export interface Level {
  organizationId: string;
  id: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  description: string | null;
  color: string;
}
