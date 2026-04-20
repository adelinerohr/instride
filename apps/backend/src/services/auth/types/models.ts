import { MembershipRole } from "@instride/shared";
import type { InvitationStatus } from "@instride/shared";

import { Organization } from "@/services/organizations/types/models";

export interface AuthUser {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  phone?: string | null;
  profilePictureUrl?: string | null;
  banned?: boolean | null;
  role?: string | null;
  banReason?: string | null;
  banExpires?: Date | string | null;
  dateOfBirth?: string | null;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: MembershipRole[];
  status: InvitationStatus;
  inviterId: string;
  expiresAt: Date;
  createdAt: Date;
  organization?: Organization;
}

export interface AuthSession {
  id: string;
  expiresAt: Date | string;
  token: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string | null;
  impersonatedBy: string | null;
  activeOrganizationId: string | null;
  contextOrganizationId: string | null;
}

export interface AuthVerification {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AuthAccount {
  id: string;
  accountId: string;
  providerId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | string | null;
  scope: string | null;
  password: string | null;
}

export interface Session {
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null | undefined | undefined;
    userAgent?: string | null | undefined | undefined;
    contextOrganizationId?: string | null | undefined;
    impersonatedBy?: string | null | undefined;
    activeOrganizationId?: string | null | undefined;
  };
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined | undefined;
    phone?: string | null | undefined;
    profilePictureUrl?: string | null | undefined;
    dateOfBirth?: string | null | undefined;
    banned: boolean | null | undefined;
    role?: string | null | undefined;
    banReason?: string | null | undefined;
    banExpires?: Date | null | undefined;
  };
}
