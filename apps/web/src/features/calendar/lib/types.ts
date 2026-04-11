import { DayOfWeek } from "@instride/shared";

export enum CalendarView {
  DAY = "day",
  WEEK = "week",
  AGENDA = "agenda",
}

export interface CalendarBusinessHours {
  isOpen: boolean;
  boardId: string | null;
  startTime: string | null;
  endTime: string | null;
  dayOfWeek: DayOfWeek;
}

export type EffectiveBusinessHours = Record<DayOfWeek, CalendarBusinessHours>;
export type TrainerEffectiveBusinessHours = Record<
  string,
  EffectiveBusinessHours
>;

export interface VisibleHours {
  from: number;
  to: number;
}
