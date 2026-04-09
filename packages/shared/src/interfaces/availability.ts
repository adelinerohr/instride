import { DayOfWeek } from "../models/enums";

export interface TimeBlock {
  id: string;
  organizationId: string;
  trainerMemberId: string;
  start: Date | string;
  end: Date | string;
  reason: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BusinessHours {
  id: string;
  organizationId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  openTime: string | null; // "HH:MM" or null = closed
  closeTime: string | null;
  isClosed: boolean;
}

export interface DayHours {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export interface TrainerDayHours extends DayHours {
  inheritsFromOrg: boolean;
}
