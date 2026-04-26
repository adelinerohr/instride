// Drizzle `with` fragments — shared across endpoints so the shape returned
// matches the contract consistently.

export const boardAssignmentExpansion = {
  trainer: {
    with: {
      member: {
        with: { authUser: true },
      },
      boardAssignments: {
        with: { board: true },
      },
    },
  },
  rider: {
    with: {
      level: true,
      member: {
        with: { authUser: true },
      },
      boardAssignments: {
        with: { board: true },
      },
    },
  },
} as const;

export const boardExpansion = {
  assignments: {
    with: boardAssignmentExpansion,
  },
  serviceBoardAssignments: true,
} as const;

export const serviceExpansion = {
  restrictedToLevel: true,
  boardAssignments: true,
  trainerAssignments: true,
} as const;
