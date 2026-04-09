import type {
  Board,
  LessonInstanceWithEnrollments,
  TimeBlock,
  Trainer,
} from "@instride/shared";
import * as React from "react";

import type { CalendarSearchParams } from "../lib/search-params";
import { useAgendaView } from "./use-agenda-view";
import { useDayView } from "./use-day-view";
import { useFilteredData } from "./use-filtered-data";
import { useWeekView } from "./use-week-view";

type CalendarModelInput = {
  search: CalendarSearchParams;
  date: Date;
  lessons: LessonInstanceWithEnrollments[];
  timeBlocks: TimeBlock[];
  boards: Board[];
  trainers: Trainer[];
};

export function useCalendarModel(input: CalendarModelInput) {
  const { view, lessonId, timeBlockId, createTimeBlock } = input.search;

  const lookups = React.useMemo(() => {
    const trainersById = Object.fromEntries(
      input.trainers.map((trainer) => [trainer.id, trainer])
    );
    const boardsById = Object.fromEntries(
      input.boards.map((board) => [board.id, board])
    );

    return {
      trainers: input.trainers,
      trainersById,
      boardsById,
    };
  }, [input.trainers, input.boards]);

  const filtered = useFilteredData({
    lessons: input.lessons,
    timeBlocks: input.timeBlocks,
    selectedBoardId: input.search.boardId,
    selectedTrainerIds: input.search.trainerIds,
  });

  const week = useWeekView({
    date: input.date,
    lessons: filtered.lessons,
    timeBlocks: filtered.timeBlocks,
  });

  const day = useDayView({
    date: input.date,
    lessons: filtered.lessons,
    timeBlocks: filtered.timeBlocks,
    trainers: input.trainers,
    selectedTrainerIds: input.search.trainerIds,
  });

  const agenda = useAgendaView({
    date: input.date,
    lessons: filtered.lessons,
    timeBlocks: filtered.timeBlocks,
  });

  return {
    lookups,
    headerProps: {
      date: input.date,
      view,
      boards: input.boards,
      trainers: input.trainers,
      selectedBoardId: input.search.boardId,
      selectedTrainerIds: input.search.trainerIds ?? [],
    },
    views: {
      week,
      day,
      agenda,
    },
    modalState: {
      lessonId,
      timeBlockId,
      createTimeBlock: !!createTimeBlock,
    },
  };
}
