import { queryOptions, useQuery } from "@tanstack/react-query";

import { STALE } from "#_internal/constants";
import { apiClient, boards } from "#client";

import { boardAssignmentKeys, boardKeys } from "./keys";

export const boardsOptions = {
  list: (params?: boards.ListBoardsRequest) =>
    queryOptions({
      queryKey: boardKeys.list(params),
      queryFn: async () => {
        const { boards } = await apiClient.boards.listBoards(params ?? {});
        return boards;
      },
      staleTime: STALE.MINUTES.FIVE,
    }),
  byId: (boardId: string) =>
    queryOptions({
      queryKey: boardKeys.byId(boardId),
      queryFn: async () => {
        const { board } = await apiClient.boards.getBoard(boardId);
        return board;
      },
    }),
};

export const boardAssignmentsOptions = {
  byBoard: (boardId: string, type: "all" | "trainer" | "rider") =>
    queryOptions({
      queryKey: [...boardAssignmentKeys.byBoard(boardId), type] as const,
      queryFn: async () => {
        const { assignments } = await apiClient.boards.listBoardAssignments(
          boardId,
          { type }
        );
        return assignments;
      },
    }),
  byTrainer: (trainerId: string) =>
    queryOptions({
      queryKey: boardAssignmentKeys.byTrainer(trainerId),
      queryFn: async () => {
        const { assignments } = await apiClient.boards.listMemberAssignments(
          trainerId,
          { isTrainer: true }
        );
        return assignments;
      },
    }),
  byRider: (riderId: string) =>
    queryOptions({
      queryKey: boardAssignmentKeys.byRider(riderId),
      queryFn: async () => {
        const { assignments } = await apiClient.boards.listMemberAssignments(
          riderId,
          { isTrainer: false }
        );
        return assignments;
      },
    }),
};

export function useBoards() {
  return useQuery(boardsOptions.list());
}

export function useBoard(boardId: string) {
  return useQuery(boardsOptions.byId(boardId));
}

export function useRiderAssignments(riderId: string) {
  return useQuery(boardAssignmentsOptions.byRider(riderId));
}

export function useTrainerAssignments(trainerId: string) {
  return useQuery(boardAssignmentsOptions.byTrainer(trainerId));
}

export function useBoardAssignments(
  boardId: string,
  type: "all" | "trainer" | "rider"
) {
  return useQuery(boardAssignmentsOptions.byBoard(boardId, type));
}
