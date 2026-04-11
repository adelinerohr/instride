import { useRiderAssignments, type types } from "@instride/api";

export async function getInitialPortalState(
  boards: types.Board[],
  riderId: string
) {
  const { data: assignments } = useRiderAssignments(riderId);
  const assignedBoards = boards.filter((board) =>
    assignments?.some((assignment) => assignment.boardId === board.id)
  );

  return assignedBoards;
}
