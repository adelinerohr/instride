import type { types } from "@instride/api";

export enum CalendarView {
  DAY = "day",
  WEEK = "week",
  AGENDA = "agenda",
}

export type DateRange = { start: Date; end: Date };
export type TimeRange = { start: Date; end: Date };

export type Position = {
  top: number;
  height: number;
};

export type LaneAssignment<T> = {
  item: T;
  laneIndex: number;
  laneCount: number;
};

export type PositionedLesson = {
  id: string;
  lesson: types.LessonInstance;
  start: Date;
  end: Date;
  top: number;
  height: number;
  left: number;
  width: number;
  laneIndex: number;
  laneCount: number;
};

export type LessonWithDates = {
  id: string;
  lesson: types.LessonInstance;
  start: Date;
  end: Date;
};

export type PositionedTimeBlock = {
  id: string;
  timeBlock: types.TimeBlock;
  start: Date;
  end: Date;
  top: number;
  height: number;
};

export type TimeBlockWithDates = {
  id: string;
  timeBlock: types.TimeBlock;
  start: Date;
  end: Date;
};

export type WeekDayColumn = {
  date: Date;
  lessons: PositionedLesson[];
  timeBlocks: PositionedTimeBlock[];
};

export type DayTrainerColumn = {
  trainer: types.Trainer;
  lessons: PositionedLesson[];
  timeBlocks: PositionedTimeBlock[];
};

export type AgendaItem =
  | {
      type: "lesson";
      id: string;
      start: Date;
      end: Date;
      lesson: types.LessonInstance;
    }
  | {
      type: "timeBlock";
      id: string;
      start: Date;
      end: Date;
      block: types.TimeBlock;
    };

export type AgendaDay = {
  date: Date;
  items: AgendaItem[];
};
