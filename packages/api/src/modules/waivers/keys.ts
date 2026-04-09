const getWaiverRootKey = (organizationId: string) =>
  ["waivers", organizationId] as const;

export const waiverKeys = (organizationId: string) => ({
  all: () => getWaiverRootKey(organizationId),
  byId: (waiverId: string) =>
    [...getWaiverRootKey(organizationId), waiverId] as const,
});
