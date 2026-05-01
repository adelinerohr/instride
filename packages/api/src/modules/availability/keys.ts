// Key hierarchy:
//   ["availability", orgId]                                    ← everything
//   ["availability", orgId, "time-blocks"]                     ← all time blocks
//   ["availability", orgId, "time-blocks", "range", from, to]  ← date-scoped
//   ["availability", orgId, "time-blocks", "trainer", id]      ← per trainer
//   ["availability", orgId, "org"]                             ← org availability windows
//   ["availability", orgId, "trainer", trainerId]              ← trainer availability windows

import { AvailableSlotsRequest } from "#contracts";

const availableSlotsRootKey = ["available-slots"] as const;

const businessHoursRootKey = [
  ...availableSlotsRootKey,
  "business-hours",
] as const;
const BLOCKS_ROOT = [...availableSlotsRootKey, "time-blocks"] as const;

export const availabilityKeys = {
  listBusinessHours: () => businessHoursRootKey,
  organizationBusinessHours: () => [...businessHoursRootKey, "org"] as const,
  trainerBusinessHours: (trainerId: string) =>
    [...businessHoursRootKey, "trainer", trainerId] as const,

  listTimeBlocks: () => BLOCKS_ROOT,
  timeBlocksAll: () => [...BLOCKS_ROOT, "list", "all"] as const,
  timeBlocksInRange: (from: Date, to: Date) =>
    [
      ...BLOCKS_ROOT,
      "list",
      "range",
      from.toISOString(),
      to.toISOString(),
    ] as const,
  timeBlocksForTrainer: (trainerId: string) =>
    [...BLOCKS_ROOT, "list", "trainer", trainerId] as const,
  timeBlockById: (id: string) => [...BLOCKS_ROOT, "detail", id] as const,

  availableSlots: (params: AvailableSlotsRequest) =>
    [...availableSlotsRootKey, params] as const,
};
