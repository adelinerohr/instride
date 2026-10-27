import { useRiderAssignments, type Board } from "@instride/client";

export async function getInitialPortalState(boards: Board[], riderId: string) {
  const { data: assignments } = useRiderAssignments(riderId);
  const assignedBoards = boards.filter((board) =>
    assignments?.some((assignment) => assignment.boardId === board.id)
  );

  return assignedBoards;
}
