import { MembershipRole } from "../models/enums";

export interface User {
  id: string;
  name: string;
  createdAt: Date | string;
  phone: string | null;
  updatedAt: Date | string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  profilePictureUrl: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | string | null;
}

export interface Member {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string;
  organizationId: string;
  isPlaceholder: boolean;
  authMemberId: string;
  roles: MembershipRole[];
  onboardingComplete: boolean;
  deletedAt: Date | string | null;
}

export interface MemberWithUser extends Member {
  authUser: User;
}

export interface MemberWithRoles extends MemberWithUser {
  trainerProfile: Trainer | null;
  riderProfile: Rider | null;
}

export interface Trainer {
  organizationId: string;
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  memberId: string;
  bio: string | null;
  member: MemberWithUser;
}

export interface Rider {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  memberId: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  ridingLevelId: string | null;
  member: MemberWithUser;
}
