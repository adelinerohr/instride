import { TimeBlock } from "../interfaces/availability";

export interface CreateTimeBlockRequest {
  start: string;
  end: string;
  reason: string | null;
}

export interface CreateTimeBlockResponse {
  timeBlock: TimeBlock;
}

export interface ListTimeBlocksResponse {
  timeBlocks: TimeBlock[];
}

export interface ListTimeBlocksForDateRangeRequest {
  from: string;
  to: string;
}
