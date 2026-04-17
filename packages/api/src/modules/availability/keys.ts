// Key hierarchy:
//   ["availability", orgId]                                    ← everything
//   ["availability", orgId, "time-blocks"]                     ← all time blocks
//   ["availability", orgId, "time-blocks", "range", from, to]  ← date-scoped
//   ["availability", orgId, "time-blocks", "trainer", id]      ← per trainer
//   ["availability", orgId, "org"]                             ← org availability windows
//   ["availability", orgId, "trainer", trainerId]              ← trainer availability windows

import type { availability } from "#client";

const availableSlotsRootKey = ["available-slots"] as const;

const businessHoursRootKey = [
  ...availableSlotsRootKey,
  "business-hours",
] as const;
const timeBlocksRootKey = [...availableSlotsRootKey, "time-blocks"] as const;

export const availabilityKeys = {
  listBusinessHours: () => businessHoursRootKey,
  organizationBusinessHours: () => [...businessHoursRootKey, "org"] as const,
  trainerBusinessHours: (trainerId: string) =>
    [...businessHoursRootKey, "trainer", trainerId] as const,

  listTimeBlocks: () => timeBlocksRootKey,
  timeBlockById: (id: string) => [...timeBlocksRootKey, id] as const,
  timeBlocksInRange: (from: Date, to: Date) =>
    [
      ...timeBlocksRootKey,
      "range",
      from.toISOString(),
      to.toISOString(),
    ] as const,
  timeBlocksForTrainer: (trainerId: string) =>
    [...timeBlocksRootKey, "trainer", trainerId] as const,

  availableSlots: (params: availability.AvailableSlotsParams) =>
    [...availableSlotsRootKey, params] as const,
};
