export const activityKeys = {
  listMember: (memberId: string) => ["activity", memberId] as const,
  listRider: (riderId: string, ownerMemberId: string) =>
    [...activityKeys.listMember(ownerMemberId), "rider", riderId] as const,
  listTrainer: (trainerId: string, ownerMemberId: string) =>
    [...activityKeys.listMember(ownerMemberId), "trainer", trainerId] as const,
};
