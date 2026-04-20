import {
  OrganizationBoardBusinessHours,
  OrganizationBusinessHours,
  TimeBlock,
  TrainerBoardBusinessHours,
  TrainerBusinessHours,
} from "./models";

export interface ListTimeBlocksResponse {
  timeBlocks: TimeBlock[];
}

/**
 * Business hours grouped into org-wide defaults vs per-board overrides.
 * Both `defaults` and `boardOverrides[id]` contain day-rows with their slots inlined.
 */
export interface ListTrainerBusinessHoursResponse {
  defaults: TrainerBusinessHours[];
  boardOverrides: Record<string, TrainerBoardBusinessHours[]>;
}

export interface ListOrganizationBusinessHoursResponse {
  defaults: OrganizationBusinessHours[];
  boardOverrides: Record<string, OrganizationBoardBusinessHours[]>;
}
