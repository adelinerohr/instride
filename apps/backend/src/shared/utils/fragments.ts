export const memberFragment = {
  with: { authUser: true },
} as const;

export const riderWithAssignmentsFragment = {
  with: {
    boardAssignments: true,
    level: true,
  },
} as const;

export const memberRiderFragment = {
  with: {
    authUser: true,
    rider: riderWithAssignmentsFragment,
  },
} as const;
