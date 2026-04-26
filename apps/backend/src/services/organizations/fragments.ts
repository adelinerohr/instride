// Shared query fragments — use these inside `with: { ... }` clauses to ensure
// the loaded shape matches what the contracts expect.

// Loads what a "Member" in contracts needs: authUser + rider/trainer profile summaries.
export const memberExpansion = {
  authUser: true,
  rider: true,
  trainer: true,
} as const;

export const userExpansion = {
  member: {
    with: {
      authUser: true,
    },
  },
} as const;

// Loads what a "Rider" in contracts needs: level + boardAssignments(+board) + member(+authUser).
export const riderExpansion = {
  level: true,
  boardAssignments: {
    with: {
      board: true,
    },
  },
  ...userExpansion,
} as const;

// Loads what a "Trainer" in contracts needs.
export const trainerExpansion = {
  boardAssignments: {
    with: {
      board: true,
    },
  },
  ...userExpansion,
} as const;
