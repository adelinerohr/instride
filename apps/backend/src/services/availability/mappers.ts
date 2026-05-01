import type {
  BoardBusinessHours,
  BusinessHours,
  BusinessHoursDay,
  TimeBlock,
} from "@instride/api/contracts";

import { toISO, toTimestamps } from "@/shared/utils/mappers";

import type {
  OrganizationAvailabilitySlotRow,
  TrainerAvailabilitySlotRow,
  OrganizationAvailabilityRow,
  TimeBlockRow,
  TrainerAvailabilityRow,
} from "./schema";

// ============================================================================
// Business hours
// ============================================================================

type AvailabilitySlotRow =
  | OrganizationAvailabilitySlotRow
  | TrainerAvailabilitySlotRow;

type AvailabilityDayRow = (
  | OrganizationAvailabilityRow
  | TrainerAvailabilityRow
) & {
  slots: AvailabilitySlotRow[];
};

export function toBusinessHours(row: AvailabilityDayRow): BusinessHours {
  return {
    id: row.id,
    organizationId: row.organizationId,
    boardId: row.boardId,
    dayOfWeek: row.dayOfWeek,
    isOpen: row.isOpen,
    slots: row.slots.map(toAvailabilitySlot),
    ...toTimestamps(row.createdAt, row.updatedAt),
  };
}

export function toBoardBusinessHours(
  row: AvailabilityDayRow & { boardId: string }
): BoardBusinessHours {
  return {
    ...toBusinessHours(row),
    boardId: row.boardId,
  };
}

export function toAvailabilitySlot(row: AvailabilitySlotRow) {
  return {
    id: row.id,
    availabilityId: row.availabilityId,
    openTime: row.openTime,
    closeTime: row.closeTime,
    ...toTimestamps(row.createdAt, row.updatedAt),
  };
}

export function toBusinessHoursDay(row: AvailabilityDayRow): BusinessHoursDay {
  return {
    dayOfWeek: row.dayOfWeek,
    isOpen: row.isOpen,
    slots: row.slots.map((s) => ({
      openTime: s.openTime,
      closeTime: s.closeTime,
    })),
  };
}

// ============================================================================
// Time blocks
// ============================================================================

export function toTimeBlock(row: TimeBlockRow): TimeBlock {
  return {
    id: row.id,
    organizationId: row.organizationId,
    trainerId: row.trainerId,
    boardId: row.boardId,
    start: toISO(row.start),
    end: toISO(row.end),
    reason: row.reason,
    ...toTimestamps(row.createdAt, row.updatedAt),
  };
}
