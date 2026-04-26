export const memberFragment = {
  with: { authUser: true },
} as const;

export const trainerFragment = {
  with: {
    member: memberFragment,
  },
} as const;

export const riderFragment = {
  with: {
    member: memberFragment,
  },
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

export const lessonInstanceFragment = {
  with: {
    series: true,
    service: true,
    board: true,
    trainer: trainerFragment,
    enrollments: {
      with: {
        rider: riderFragment,
      },
    },
  },
} as const;
