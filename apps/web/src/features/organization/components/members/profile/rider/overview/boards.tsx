import {
  boardAssignmentsOptions,
  useAssignToBoard,
  useBoards,
  useRemoveFromBoard,
  type types,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/shared/components/ui/combobox";
import { Field, FieldLabel } from "@/shared/components/ui/field";

export interface RiderBoardsTabProps {
  member: types.Member;
}

export function RiderBoardsTab({ member }: RiderBoardsTabProps) {
  const { data: boards, isLoading } = useBoards();
  const { data: riderAssignments, isLoading: isRiderAssignmentsLoading } =
    useSuspenseQuery(boardAssignmentsOptions.byRider(member.id));

  const assignRiderToBoard = useAssignToBoard();
  const removeRiderFromBoard = useRemoveFromBoard();

  if (!boards || isLoading || isRiderAssignmentsLoading) {
    return (
      <div className="p-4">
        <div className="h-40 rounded-xl bg-muted" />
      </div>
    );
  }

  const selectedBoards = boards.filter((board) =>
    riderAssignments.some(
      (riderAssignment) => riderAssignment.boardId === board.id
    )
  );

  const handleChange = (values: types.Board[]) => {
    // Calculate the difference between the new values and the old values
    const newBoardIds = values.map((board) => board.id);
    const oldBoardIds = riderAssignments.map(
      (riderAssignment) => riderAssignment.boardId
    );
    const boardIdsToAdd = newBoardIds.filter((id) => !oldBoardIds.includes(id));
    const boardIdsToRemove = oldBoardIds.filter(
      (id) => !newBoardIds.includes(id)
    );

    // Add the boards to the rider
    boardIdsToAdd.forEach((boardId) => {
      assignRiderToBoard.mutateAsync({
        boardId,
        riderId: member.id,
      });
    });

    // Remove the boards from the rider
    boardIdsToRemove.forEach((boardId) => {
      const assignment = riderAssignments.find(
        (riderAssignment) => riderAssignment.boardId === boardId
      );
      if (assignment) {
        removeRiderFromBoard.mutateAsync({
          assignmentId: assignment.id,
        });
      }
    });
  };

  return (
    <div className="p-4">
      <Field>
        <FieldLabel>Assigned Boards</FieldLabel>
        <Combobox
          multiple
          value={selectedBoards}
          items={boards}
          onValueChange={handleChange}
        >
          <ComboboxChips>
            <ComboboxValue>
              {(values) => (
                <React.Fragment>
                  {values.map((board: types.Board) => (
                    <ComboboxChip key={board.id}>{board.name}</ComboboxChip>
                  ))}
                </React.Fragment>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxEmpty>No boards found</ComboboxEmpty>
            <ComboboxList>
              {(board: types.Board) => (
                <ComboboxItem key={board.id} value={board}>
                  {board.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
    </div>
  );
}
