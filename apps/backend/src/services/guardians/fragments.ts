import { riderExpansion } from "@/services/organizations/fragments";

const memberWithAuth = {
  with: { authUser: true },
} as const;

export const relationshipWithMembersExpansion = {
  guardian: memberWithAuth,
  dependent: memberWithAuth,
} as const;

export const relationshipWithGuardianExpansion = {
  guardian: memberWithAuth,
} as const;

export const myDependentExpansion = {
  dependent: {
    with: {
      authUser: true,
      rider: { with: riderExpansion },
    },
  },
} as const;

export const invitationWithContextExpansion = {
  relationship: {
    with: {
      organization: true,
      guardian: memberWithAuth,
      dependent: memberWithAuth,
    },
  },
} as const;
