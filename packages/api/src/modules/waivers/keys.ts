const getWaiverRootKey = ["waivers"] as const;

export const waiverKeys = {
  list: () => getWaiverRootKey,
  byId: (waiverId: string) => [...getWaiverRootKey, waiverId] as const,
};
