import { BoardBusinessHours, BusinessHours, TimeBlock } from "./models";

export interface ListTimeBlocksResponse {
  timeBlocks: TimeBlock[];
}

/**
 * Business hours grouped into org-wide defaults vs per-board overrides.
 * Both `defaults` and `boardOverrides[id]` contain day-rows with their slots inlined.
 */
export interface ListBusinessHoursResponse {
  defaults: BusinessHours[];
  boardOverrides: Record<string, BoardBusinessHours[]>;
}
