import type { InvitationStatus, MembershipRole } from "@instride/shared";

import { AuthUser } from "./auth";
import { BoardAssignmentSummary } from "./boards";

// ============================================================================
// Invitation
// ============================================================================

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  roles: MembershipRole[];
  status: InvitationStatus;
  inviterId: string;
  expiresAt: string;
  createdAt: string;
}

// ============================================================================
// Organization
// ============================================================================

export interface Organization {
  id: string;
  authOrganizationId: string;
  slug: string;
  name: string;
  timezone: string;
  phone: string | null;
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
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Level
// ============================================================================

export interface Level {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Member / Rider / Trainer
// ============================================================================
// A member can hold multiple roles simultaneously (rider + trainer).
// `rider` and `trainer` are the profile summaries — present if they hold
// that role, null otherwise. They don't have their own relations loaded here
// (no level, no board assignments) to keep the type from exploding.

export interface Member {
  id: string;
  organizationId: string;
  userId: string;
  authMemberId: string;
  kioskPin: string | null;
  isPlaceholder: boolean;
  roles: MembershipRole[];
  onboardingComplete: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authUser: AuthUser;
  rider: RiderProfile | null;
  trainer: TrainerProfile | null;
}

// A rider profile as it appears under a Member — scalar-only, no relations.
export interface RiderProfile {
  id: string;
  organizationId: string;
  memberId: string;
  ridingLevelId: string | null;
  isRestricted: boolean;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// A trainer profile as it appears under a Member — scalar-only, no relations.
export interface TrainerProfile {
  id: string;
  organizationId: string;
  memberId: string;
  bio: string | null;
  allowSameDayBookings: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// A rider as a top-level entity — includes level, board assignments, and member context.
// This is what rider-focused endpoints return.
export interface Rider extends RiderProfile {
  level: Level | null;
  boardAssignments: BoardAssignmentSummary[];
  member: MemberSummary;
}

// A rider summary — rider scalars plus member context.
export interface RiderSummary extends RiderProfile {
  member: MemberSummary;
}

// A trainer as a top-level entity.
export interface Trainer extends TrainerProfile {
  boardAssignments: BoardAssignmentSummary[];
  member: MemberSummary;
}

// A trainer summary — trainer scalars plus member context.
export interface TrainerSummary extends TrainerProfile {
  member: MemberSummary;
}

// A member summary — member scalars plus authUser, without rider/trainer
// profiles (to avoid Member -> Rider -> Member recursion).
export interface MemberSummary {
  id: string;
  organizationId: string;
  userId: string;
  authMemberId: string;
  kioskPin: string | null;
  isPlaceholder: boolean;
  roles: MembershipRole[];
  onboardingComplete: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authUser: AuthUser;
}

// ============================================================================
// Request types
// ============================================================================

export interface CreateOrganizationRequest {
  slug: string;
  name: string;
  phone?: string | null;
  timezone: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  allowSameDayBookings?: boolean;
  allowPublicJoin?: boolean;
}

export interface UpdateOrganizationRequest extends Partial<CreateOrganizationRequest> {
  organizationId: string;
}

export interface CreateRiderRequest {
  memberId: string;
  isRestricted?: boolean;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  ridingLevelId?: string | null;
}

export interface UpdateRiderRequest extends Partial<CreateRiderRequest> {
  riderId: string;
}

export interface CreateTrainerRequest {
  memberId: string;
  bio?: string | null;
  allowSameDayBookings?: boolean;
}

export interface UpdateTrainerRequest extends Partial<CreateTrainerRequest> {
  trainerId: string;
}

export interface CreateLevelRequest {
  name: string;
  description?: string | null;
  color: string;
}

export interface UpdateLevelRequest extends Partial<CreateLevelRequest> {
  id: string;
}

export interface SendInvitationRequest {
  organizationId: string;
  email: string;
  roles: MembershipRole[];
}

export interface JoinOrganizationRequest {
  organizationId: string;
  roles?: MembershipRole[];
}

export interface ChangeRoleRequest {
  memberId: string;
  roles: MembershipRole[];
}

export interface AcceptInvitationRequest {
  id: string;
}

export interface RejectInvitationRequest {
  id: string;
}

// ============================================================================
// Response types
// ============================================================================

export interface GetOrganizationResponse {
  organization: Organization;
}

export interface ListOrganizationsResponse {
  organizations: Organization[];
}

export interface ListMyOrganizationsResponse {
  organizations: {
    organization: Organization;
    roles: MembershipRole[];
  }[];
}

export interface UpdateOrganizationResponse {
  organization: Organization;
}

export interface ListMembersResponse {
  members: Member[];
}

export interface GetMemberResponse {
  member: Member;
}

export interface ListRidersResponse {
  riders: Rider[];
}

export interface GetRiderResponse {
  rider: Rider;
}

export interface ListTrainersResponse {
  trainers: Trainer[];
}

export interface GetTrainerResponse {
  trainer: Trainer;
}

export interface ListLevelsResponse {
  levels: Level[];
}

export interface GetLevelResponse {
  level: Level;
}

export interface ListInvitationsResponse {
  invitations: Invitation[];
}

export interface ListMyInvitedRolesResponse {
  roles: MembershipRole[];
}

export interface GetInvitationResponse {
  invitation: Invitation;
}
