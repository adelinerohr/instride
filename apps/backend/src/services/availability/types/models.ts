import { DayOfWeek } from "@instride/shared";

export interface OrganizationBusinessHours {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  boardId: string | null;
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export interface TrainerBusinessHours {
  organizationId: string;
  trainerId: string;
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  boardId: string | null;
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
  inheritsFromOrg: boolean;
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

export interface DayHours {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export interface TrainerDayHours extends DayHours {
  inheritsFromOrg: boolean;
}

export enum EffectiveDayHoursSource {
  BOARD_OVERRIDE = "board_override",
  ORGANIZATION_DEFAULT = "organization_default",
  TRAINER_DEFAULT = "trainer_default",
  TRAINER_BOARD_OVERRIDE = "trainer_board_override",
}

export interface EffectiveDayHours extends DayHours {
  source: EffectiveDayHoursSource;
}
