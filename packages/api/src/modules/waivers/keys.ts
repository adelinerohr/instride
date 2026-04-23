const getWaiverRootKey = ["waivers"] as const;

export const waiverKeys = {
  list: (organizationId: string) =>
    [...getWaiverRootKey, organizationId] as const,
  byId: (waiverId: string) => [...getWaiverRootKey, waiverId] as const,
};
