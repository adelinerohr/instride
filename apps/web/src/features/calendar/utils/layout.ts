import type { types } from "@instride/api";

import { SLOT_HEIGHT, TOTAL_HEIGHT } from "../lib/constants";
import type {
  LaneAssignment,
  LessonWithDates,
  Position,
  PositionedLesson,
  PositionedTimeBlock,
  TimeBlockWithDates,
} from "../lib/types";
import { clampToVisibleRange, getVisibleDayRange, toDate } from "./date";
import { filterLessonsForDay, filterTimeBlocksForDay } from "./events";

export function getTopAndHeight(start: Date, end: Date, day: Date): Position {
  const visible = getVisibleDayRange(day);
  const clamped = clampToVisibleRange(start, end, day);

  const startMinutes =
    (clamped.start.getTime() - visible.start.getTime()) / 1000 / 60;
  const durationMinutes =
    (clamped.end.getTime() - clamped.start.getTime()) / 1000 / 60;

  const top = (startMinutes / 60) * SLOT_HEIGHT;
  const height = Math.max((durationMinutes / 60) * SLOT_HEIGHT, 18);

  return {
    top,
    height: Math.min(height, TOTAL_HEIGHT),
  };
}

export function normalizeLessons(
  lessons: types.LessonInstance[]
): LessonWithDates[] {
  return lessons.map((lesson) => ({
    id: lesson.id,
    lesson,
    start: toDate(lesson.start),
    end: toDate(lesson.end),
  }));
}

export function normalizeTimeBlocks(
  timeBlocks: types.TimeBlock[]
): TimeBlockWithDates[] {
  return timeBlocks.map((timeBlock) => ({
    id: timeBlock.id,
    timeBlock,
    start: toDate(timeBlock.start),
    end: toDate(timeBlock.end),
  }));
}

export function assignOverlapLanes<T extends { start: Date; end: Date }>(
  items: T[]
): LaneAssignment<T>[] {
  if (items.length === 0) return [];

  const sorted = [...items].sort((a, b) => {
    const diff = a.start.getTime() - b.start.getTime();
    if (diff !== 0) return diff;
    return a.end.getTime() - b.end.getTime();
  });

  const result: LaneAssignment<T>[] = [];
  let cluster: T[] = [];
  let clusterMaxEnd: Date | null = null;

  const flushCluster = () => {
    if (cluster.length === 0) return;

    const lanes: T[][] = [];
    const clusterAssignments: LaneAssignment<T>[] = [];

    for (const item of cluster) {
      let placedLane = -1;

      for (let laneIndex = 0; laneIndex < lanes.length; laneIndex++) {
        const lane = lanes[laneIndex];
        const last = lane[lane.length - 1];

        if (last.end.getTime() <= item.start.getTime()) {
          lane.push(item);
          placedLane = laneIndex;
          break;
        }
      }

      if (placedLane === -1) {
        lanes.push([item]);
        placedLane = lanes.length - 1;
      }

      clusterAssignments.push({
        item,
        laneIndex: placedLane,
        laneCount: 0,
      });
    }

    const laneCount = lanes.length;

    for (const assignment of clusterAssignments) {
      assignment.laneCount = laneCount;
      result.push(assignment);
    }

    cluster = [];
    clusterMaxEnd = null;
  };

  for (const item of sorted) {
    if (!clusterMaxEnd) {
      cluster.push(item);
      clusterMaxEnd = item.end;
      continue;
    }

    if (item.start.getTime() < clusterMaxEnd.getTime()) {
      cluster.push(item);
      if (item.end.getTime() > clusterMaxEnd.getTime()) {
        clusterMaxEnd = item.end;
      }
    } else {
      flushCluster();
      cluster.push(item);
      clusterMaxEnd = item.end;
    }
  }

  flushCluster();

  return result;
}

export function buildDayLessonsLayout(args: {
  day: Date;
  lessons: types.LessonInstance[];
}): PositionedLesson[] {
  const lessonsForDay = filterLessonsForDay(args.lessons, args.day);

  const laneAssignments = assignOverlapLanes(lessonsForDay);

  return laneAssignments.map(({ item, laneIndex, laneCount }) => {
    const { top, height } = getTopAndHeight(item.start, item.end, args.day);
    const width = 100 / laneCount;
    const left = laneIndex * width;

    return {
      id: item.id,
      lesson: item.lesson,
      start: item.start,
      end: item.end,
      top,
      height,
      left,
      width,
      laneIndex,
      laneCount,
    };
  });
}

export function buildDayTimeBlocksLayout(args: {
  day: Date;
  timeBlocks: types.TimeBlock[];
}): PositionedTimeBlock[] {
  const blocksForDay = filterTimeBlocksForDay(args.timeBlocks, args.day);

  return blocksForDay.map((item) => {
    const { top, height } = getTopAndHeight(item.start, item.end, args.day);

    return {
      id: item.id,
      timeBlock: item.timeBlock,
      start: item.start,
      end: item.end,
      top,
      height,
    };
  });
}
