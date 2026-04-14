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
