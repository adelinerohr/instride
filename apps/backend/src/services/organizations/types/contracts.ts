import { Invitation } from "@/services/auth/types/models";

import { Level, Member, Organization, Rider, Trainer } from "./models";

export interface ListOrganizationsResponse {
  organizations: Organization[];
}

export interface GetOrganizationResponse {
  organization: Organization;
}

export interface ListMembersResponse {
  members: Member[];
}

export interface GetMemberResponse {
  member: Member;
}

export interface GetTrainerResponse {
  trainer: Trainer;
}

export interface ListTrainersResponse {
  trainers: Trainer[];
}

export interface GetRiderResponse {
  rider: Rider;
}

export interface ListRidersResponse {
  riders: Rider[];
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
