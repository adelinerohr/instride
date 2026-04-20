export const memberRelation = {
  with: {
    with: {
      authUser: true,
    },
  } as const,
  where: {
    authUser: true,
  } as const,
} as const;

export const withAuthUser = {
  with: { authUser: true },
} as const;

export const withAuthUserAndRoles = {
  with: {
    authUser: true,
    trainerProfile: true,
    riderProfile: true,
  },
} as const;

export const riderRelationQuery = {
  rider: {
    with: {
      member: withAuthUser,
    },
  },
} as const;

export const trainerRelationQuery = {
  trainer: {
    with: {
      member: withAuthUser,
    },
  },
} as const;

export const withAssignmentsAndUsers = {
  with: {
    assignments: {
      with: {
        member: withAuthUser,
      },
    },
  },
} as const;
