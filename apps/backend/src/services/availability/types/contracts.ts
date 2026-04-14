import {
  OrganizationBusinessHours,
  TimeBlock,
  TrainerBusinessHours,
} from "./models";

export interface ListTrainerBusinessHoursResponse {
  businessHours: TrainerBusinessHours[];
}

export interface ListOrganizationBusinessHoursResponse {
  businessHours: OrganizationBusinessHours[];
}

export interface GetTimeBlockResponse {
  timeBlock: TimeBlock;
}

export interface ListTimeBlocksResponse {
  timeBlocks: TimeBlock[];
}

export interface ListBusinessHoursResponse {
  defaults: TrainerBusinessHours[] | OrganizationBusinessHours[];
  boardOverrides: Record<
    string,
    TrainerBusinessHours[] | OrganizationBusinessHours[]
  >;
}
