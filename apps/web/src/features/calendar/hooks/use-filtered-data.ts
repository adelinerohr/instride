import type { types } from "@instride/api";
import * as React from "react";

export interface UseFilteredDataArgs {
  lessons: types.LessonInstance[];
  timeBlocks: types.TimeBlock[];
  selectedBoardId?: string;
  selectedTrainerIds?: string[];
}

export function useFilteredData({
  lessons,
  timeBlocks,
  selectedBoardId,
  selectedTrainerIds,
}: UseFilteredDataArgs) {
  return React.useMemo(() => {
    const hasTrainerFilter = !!selectedTrainerIds?.length;
    const hasBoardFilter = !!selectedBoardId;

    const filteredLessons = lessons.filter((lesson) => {
      if (
        hasTrainerFilter &&
        !selectedTrainerIds?.includes(lesson.trainerMemberId)
      )
        return false;
      if (hasBoardFilter && lesson.boardId !== selectedBoardId) return false;
      return true;
    });

    const filteredTimeBlocks = timeBlocks.filter((block) => {
      if (hasTrainerFilter && !selectedTrainerIds?.includes(block.trainerId))
        return false;
      return true;
    });

    return {
      lessons: filteredLessons,
      timeBlocks: filteredTimeBlocks,
    };
  }, [lessons, timeBlocks, selectedBoardId, selectedTrainerIds]);
}
