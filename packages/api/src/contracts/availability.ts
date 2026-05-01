import type { DayOfWeek, TimeSlot } from "@instride/shared";

// ============================================================================
// Entities
// ============================================================================

export interface BusinessHoursDay {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  slots: TimeSlot[];
}

export interface BusinessHours {
  id: string;
  organizationId: string;
  boardId: string | null;
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  slots: AvailabilitySlot[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardBusinessHours extends BusinessHours {
  boardId: string;
}

export interface AvailabilitySlot {
  id: string;
  availabilityId: string;
  openTime: string;
  closeTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlot {
  start: string;
  end: string;
  dayOfWeek: string;
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
}

export interface TimeBlock {
  id: string;
  organizationId: string;
  trainerId: string;
  boardId: string | null;
  start: string;
  end: string;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Business hours requests + responses
// ============================================================================

export interface DayHoursInput {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  slots: TimeSlot[];
}

export interface UpdateOrganizationBusinessHoursRequest {
  boardId: string | null;
  days: DayHoursInput[];
}

export interface UpdateTrainerBusinessHoursRequest {
  trainerId: string;
  boardId: string | null;
  days: DayHoursInput[];
}

export interface ResetBoardBusinessHoursParams {
  boardId: string;
}

export interface ResetTrainerBoardBusinessHoursParams {
  trainerId: string;
  boardId: string;
}

export interface ListTrainerBusinessHoursParams {
  trainerId: string;
}

export interface ListBusinessHoursResponse {
  defaults: BusinessHours[];
  boardOverrides: Record<string, BoardBusinessHours[]>;
}

export interface AvailableSlotsRequest {
  boardId: string;
  trainerId: string;
  serviceId: string;
  riderId: string;
  startDate: string;
  endDate: string;
}

export interface AvailableSlotsResponse {
  slots: AvailableSlot[];
}

// ============================================================================
// Business hours check
// ============================================================================

export interface CheckLessonHoursRequest {
  boardId: string;
  trainerId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface CheckLessonHoursResponse {
  withinOrgHours: boolean;
  withinTrainerHours: boolean | null;
  effectiveOrgHours: BusinessHoursDay | null;
  effectiveTrainerHours: BusinessHoursDay | null;
  passes: boolean;
}

// ============================================================================
// Time block requests + responses
// ============================================================================

export interface CreateTimeBlockRequest {
  trainerId: string;
  start: string;
  end: string;
  boardId?: string | null;
  reason?: string | null;
}

export interface UpdateTimeBlockRequest extends CreateTimeBlockRequest {
  id: string;
}

export interface ListTimeBlocksParams {
  trainerId?: string;
  from?: string;
  to?: string;
}

export interface GetTimeBlockResponse {
  timeBlock: TimeBlock;
}

export interface ListTimeBlocksResponse {
  timeBlocks: TimeBlock[];
}
