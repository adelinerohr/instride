// Key hierarchy:
//   ["availability", orgId]                                    ← everything
//   ["availability", orgId, "time-blocks"]                     ← all time blocks
//   ["availability", orgId, "time-blocks", "range", from, to]  ← date-scoped
//   ["availability", orgId, "time-blocks", "trainer", id]      ← per trainer
//   ["availability", orgId, "org"]                             ← org availability windows
//   ["availability", orgId, "trainer", trainerId]              ← trainer availability windows

const getBusinessHoursRootKey = ["business-hours"] as const;
const getTimeBlocksRootKey = ["time-blocks"] as const;

export const businessHoursKeys = {
  list: () => getBusinessHoursRootKey,
  organization: () => [...getBusinessHoursRootKey, "org"] as const,
  trainer: (trainerId: string) =>
    [...getBusinessHoursRootKey, "trainer", trainerId] as const,
};

export const timeBlockKeys = {
  all: () => getTimeBlocksRootKey,
  inRange: (from: Date, to: Date) =>
    [
      ...getTimeBlocksRootKey,
      "range",
      from.toISOString(),
      to.toISOString(),
    ] as const,
  forTrainer: (trainerId: string) =>
    [...getTimeBlocksRootKey, "trainer", trainerId] as const,
};
