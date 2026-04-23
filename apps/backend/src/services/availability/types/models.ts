import { DayOfWeek, TimeSlot } from "@instride/shared";

export interface AvailabilitySlot {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  availabilityId: string;
  openTime: string;
  closeTime: string;
}

export interface BusinessHours {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  boardId: string | null;
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  slots: AvailabilitySlot[];
  trainerId?: string; // present for trainer hours, absent for org hours
}

export interface BoardBusinessHours extends BusinessHours {
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
