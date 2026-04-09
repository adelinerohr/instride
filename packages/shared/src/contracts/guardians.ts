import { QuestionnaireResponse } from "../interfaces";
import {
  GuardianInvitation,
  GuardianRelationship,
} from "../interfaces/guardians";
import { Waiver } from "../interfaces/waivers";

// --- Relationships ---------------------------------------------------------

export interface EditGuardianRelationshipRequest extends Omit<
  GuardianRelationship,
  "id" | "createdAt" | "updatedAt" | "organizationId"
> {}

export interface CreateGuardianRelationshipRequest extends EditGuardianRelationshipRequest {}

export interface CreateGuardianRelationshipResponse {
  relationship: GuardianRelationship;
}

export interface CreatePlaceholderGuardianRelationshipRequest {
  profile: {
    name: string;
    email?: string;
    phone?: string;
    image?: string;
  };
  questionnaire: Pick<QuestionnaireResponse, "questionnaireId" | "responses">;
  waiver: Omit<Waiver, "id" | "createdAt" | "updatedAt">;
  dependentControls: {
    canBookLessons: boolean;
    canPostOnFeed: boolean;
  };
}

export interface ListGuardiansResponse {
  relationships: GuardianRelationship[];
}

export interface ListDependentsResponse {
  relationships: GuardianRelationship[];
}

// --- Invitations -----------------------------------------------------------

export interface CreateGuardianInvitationRequest {
  email: string;
  relationshipId: string;
}

export interface CreateGuardianInvitationResponse {
  invitation: GuardianInvitation;
}
