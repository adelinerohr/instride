import type { boards } from "#client";

const boardRootKey = ["boards"] as const;
const assignmentRootKey = ["board-assignments"] as const;

const normalizeListParams = (params?: boards.ListBoardsRequest) => {
  if (!params) return params;
  return {
    ...params,
    ...(params.riderIds && { riderIds: [...params.riderIds].sort() }),
  };
};

export const boardKeys = {
  /** Root — invalidates everything board-related */
  all: () => boardRootKey,
  /** Prefix for every list variant, regardless of params */
  lists: () => [...boardRootKey, "list"] as const,
  /** One specific parameterized list */
  list: (params?: boards.ListBoardsRequest) =>
    [...boardRootKey, "list", normalizeListParams(params)] as const,
  /** Prefix for every byId entry */
  details: () => [...boardRootKey, "byId"] as const,
  /** One board */
  byId: (boardId: string) => [...boardRootKey, "byId", boardId] as const,
};

export const boardAssignmentKeys = {
  /** Root — invalidates every assignment query */
  all: () => assignmentRootKey,
  /** Prefix for per-board listings */
  byBoards: () => [...assignmentRootKey, "board"] as const,
  /** Assignments for one board */
  byBoard: (boardId: string) =>
    [...assignmentRootKey, "board", boardId] as const,
  /** Prefix for per-rider listings */
  byRiders: () => [...assignmentRootKey, "rider"] as const,
  /** Assignments for one rider */
  byRider: (riderId: string) =>
    [...assignmentRootKey, "rider", riderId] as const,
  /** Prefix for per-trainer listings */
  byTrainers: () => [...assignmentRootKey, "trainer"] as const,
  /** Assignments for one trainer */
  byTrainer: (trainerId: string) =>
    [...assignmentRootKey, "trainer", trainerId] as const,
};
