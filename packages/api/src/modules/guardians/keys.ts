// Key hierarchy:
//   ["guardians"]                                    ← everything
//   ["guardians", "relationships"]                     ← all relationships
//   ["guardians", "relationships", "guardian", guardianMemberId]      ← guardian relationships
//   ["guardians", "relationships", "dependent", dependentMemberId]      ← dependent relationships
//   ["guardians", "my-dependents"]                             ← my dependents
//   ["guardians", "my-guardians"]                             ← my guardians
//   ["guardians", "pending"]                             ← pending relationships

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

  myGuardians: () => [...guardianKeys.all(), "my-guardians"] as const,

  pending: () => [...guardianKeys.all(), "pending"] as const,
};
