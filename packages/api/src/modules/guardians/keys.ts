export const guardianKeys = {
  all: () => ["guardians"] as const,

  relationships: () => [...guardianKeys.all(), "relationships"] as const,

  relationship: (relationshipId: string) =>
    [...guardianKeys.relationships(), relationshipId] as const,

  byGuardian: (guardianMemberId: string) =>
    [...guardianKeys.relationships(), "guardian", guardianMemberId] as const,

  byDependent: (dependentMemberId: string) =>
    [...guardianKeys.relationships(), "dependent", dependentMemberId] as const,

  myDependents: () => [...guardianKeys.all(), "my-dependents"] as const,

  myGuardian: () => [...guardianKeys.all(), "my-guardian"] as const,

  pending: () => [...guardianKeys.all(), "pending"] as const,
};
