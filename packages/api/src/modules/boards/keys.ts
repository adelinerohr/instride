import { ListBoardsForRiderRequest, ListBoardsRequest } from "#contracts";

const boardRootKey = ["boards"] as const;
const assignmentRootKey = ["board-assignments"] as const;

const normalizeListParams = (params?: ListBoardsRequest) => {
  if (!params) return undefined;
  return {
    ...params,
    ...(params.riderIds && { riderIds: [...params.riderIds].sort() }),
  };
};

export const boardKeys = {
  /** Root — invalidates every board query */
  all: () => boardRootKey,

  /** Prefix for all list queries (filtered or unfiltered) */
  lists: () => [...boardRootKey, "list"] as const,

  /** Specific list query, by params */
  list: (params?: ListBoardsRequest) => {
    const normalized = normalizeListParams(params);
    return normalized
      ? ([...boardRootKey, "list", normalized] as const)
      : ([...boardRootKey, "list"] as const);
  },

  /** Prefix for all "boards for a rider" queries */
  forRiders: () => [...boardRootKey, "for-rider"] as const,

  /** Boards visible to one rider */
  forRider: (params: ListBoardsForRiderRequest) =>
    [...boardRootKey, "for-rider", params] as const,

  /** Prefix for invalidating all individual-board caches at once */
  details: () => [...boardRootKey, "byId"] as const,

  /** One board by ID */
  byId: (boardId: string) => [...boardRootKey, "byId", boardId] as const,
};

export const boardAssignmentKeys = {
  /** Root — invalidates every assignment query */
  all: () => assignmentRootKey,

  /** Prefix for per-board listings */
  forBoards: () => [...assignmentRootKey, "board"] as const,
  /** Assignments for one board */
  forBoard: (boardId: string) =>
    [...assignmentRootKey, "board", boardId] as const,

  /** Prefix for per-rider listings */
  forRiders: () => [...assignmentRootKey, "rider"] as const,
  /** Assignments for one rider */
  forRider: (riderId: string) =>
    [...assignmentRootKey, "rider", riderId] as const,

  /** Prefix for per-trainer listings */
  forTrainers: () => [...assignmentRootKey, "trainer"] as const,
  /** Assignments for one trainer */
  forTrainer: (trainerId: string) =>
    [...assignmentRootKey, "trainer", trainerId] as const,
};
