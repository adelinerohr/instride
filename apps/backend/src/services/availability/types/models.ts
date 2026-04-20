import { DayOfWeek, TimeSlot } from "@instride/shared";

export interface OrganizationAvailabilitySlot {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  availabilityId: string;
  openTime: string;
  closeTime: string;
}

export interface TrainerAvailabilitySlot {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  availabilityId: string;
  openTime: string;
  closeTime: string;
}

export interface OrganizationBusinessHours {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  boardId: string | null;
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  slots: OrganizationAvailabilitySlot[];
}

export interface OrganizationBoardBusinessHours extends OrganizationBusinessHours {
  boardId: string;
}

export interface TrainerBusinessHours {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  trainerId: string;
  boardId: string | null;
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  slots: TrainerAvailabilitySlot[];
}

export interface TrainerBoardBusinessHours extends TrainerBusinessHours {
  boardId: string;
}

export interface TimeBlock {
  organizationId: string;
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  boardId: string | null;
  trainerId: string;
  start: Date | string;
  end: Date | string;
  reason: string | null;
}

export interface BusinessHoursDay {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  slots: TimeSlot[];
}
