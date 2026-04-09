import {
  BoardAssignment,
  Member,
  MemberWithRoles,
  MemberWithUser,
  Rider,
  Trainer,
} from "../interfaces";
import { Level, Organization } from "../interfaces/organization";

// ---- Organizations ------------------------------------------------------------

export interface GetOrganizationResponse {
  organization: Organization;
}

export interface ListOrganizationsResponse {
  organizations: Organization[];
}

export interface EditOrganizationRequest extends Omit<
  Organization,
  "id" | "createdAt" | "updatedAt"
> {}

export interface CreateOrganizationRequest {
  authOrganizationId: string;
  name: string;
  slug: string;
  timezone: string;
  allowPublicJoin: boolean;
  phone: string | null;
  state: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  postalCode: string | null;
}

export interface CreateOrganizationResponse extends GetOrganizationResponse {
  membership: Member;
}

export interface UpdateOrganizationRequest extends Partial<EditOrganizationRequest> {}

export interface UpdateOrganizationResponse extends GetOrganizationResponse {}

export interface CheckSlugResponse {
  available: boolean;
}

export interface JoinOrganizationResponse {
  membership: Member;
}

// ---- Members ------------------------------------------------------------

export interface ListMembersResponse {
  members: MemberWithUser[];
}

export interface GetMembershipResponse {
  membership: MemberWithRoles;
}

export interface ListTrainersResponse {
  trainers: Trainer[];
}

export interface ListRidersResponse {
  riders: {
    rider: Rider;
    boardAssignments: BoardAssignment[];
  }[];
}

export interface UpdateRiderRequest extends Partial<
  Omit<Rider, "id" | "createdAt" | "updatedAt" | "member">
> {}

export interface UpdateTrainerRequest extends Partial<
  Omit<Trainer, "id" | "createdAt" | "updatedAt" | "member">
> {}

// ---- Levels ------------------------------------------------------------

export interface EditLevelRequest extends Omit<
  Level,
  "id" | "createdAt" | "updatedAt"
> {}

export interface GetLevelResponse {
  level: Level;
}

export interface CreateLevelRequest extends EditLevelRequest {}

export interface CreateLevelResponse extends GetLevelResponse {}

export interface UpdateLevelRequest extends EditLevelRequest {}

export interface UpdateLevelResponse extends GetLevelResponse {}

export interface ListLevelsResponse {
  levels: Level[];
}
