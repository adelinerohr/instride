import { GuardianRelationship } from "./models";

export interface GetGuardianRelationshipResponse {
  relationship: GuardianRelationship;
}

export interface ListGuardianRelationshipsResponse {
  relationships: GuardianRelationship[];
}
