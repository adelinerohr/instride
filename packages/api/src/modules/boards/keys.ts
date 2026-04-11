import type { boards } from "#client";

const getBoardRootKey = ["boards"] as const;

const getAssignmentRootKey = ["board-assignments"] as const;

export const boardKeys = {
  /** Everything for this organization's boards */
  list: (params?: boards.ListBoardsRequest) =>
    [...getBoardRootKey, params] as const,
  /** One board and all its sub-keys */
  byId: (boardId: string) => [...getBoardRootKey, boardId] as const,
  /** All assignments for a board */
  assignments: (boardId: string) =>
    [...getBoardRootKey, boardId, "assigned-to"] as const,
  /** All assignments for a rider */
  assignedToRider: (riderId: string) =>
    [...getBoardRootKey, "assigned-to", "rider", riderId] as const,
  /** All assignments for a trainer */
  assignedToTrainer: (trainerId: string) =>
    [...getBoardRootKey, "assigned-to", "trainer", trainerId] as const,
};

export const boardAssignmentKeys = {
  /** All assignments for a board */
  list: () => getAssignmentRootKey,
  /** All assignments for one board */
  byBoard: (boardId: string) => [...getAssignmentRootKey, boardId] as const,
  /** All assignments for one rider */
  byRider: (riderId: string) =>
    [...getAssignmentRootKey, "rider", riderId] as const,
  /** All assignments for one trainer */
  byTrainer: (trainerId: string) =>
    [...getAssignmentRootKey, "trainer", trainerId] as const,
  /** Assignment for one board and one rider */
  byBoardAndRider: (boardId: string, riderId: string) =>
    [...getAssignmentRootKey, boardId, "rider", riderId] as const,
  /** Assignment for one board and one trainer */
  byBoardAndTrainer: (boardId: string, trainerId: string) =>
    [...getAssignmentRootKey, boardId, "trainer", trainerId] as const,
};
