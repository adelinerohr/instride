import { queryOptions, skipToken, useQuery } from "@tanstack/react-query";

import { STALE } from "#_internal/constants";
import { apiClient } from "#client";
import { ListBoardsForRiderRequest, ListBoardsRequest } from "#contracts";

import { boardAssignmentKeys, boardKeys } from "./keys";

export const boardsOptions = {
  list: (params?: ListBoardsRequest) =>
    queryOptions({
      queryKey: boardKeys.list(params),
      queryFn: async () => {
        const { boards } = await apiClient.boards.listBoards(params ?? {});
        return boards;
      },
      staleTime: STALE.MINUTES.FIVE,
    }),
  forRider: (params: ListBoardsForRiderRequest) =>
    queryOptions({
      queryKey: boardKeys.forRider(params),
      queryFn: params
        ? async () => {
            const { boards } = await apiClient.boards.listBoardsForRider(
              params.riderId,
              { canRiderAdd: params.canRiderAdd }
            );
            return boards;
          }
        : skipToken,
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
  byBoard: (boardId: string, type?: "trainer" | "rider") =>
    queryOptions({
      queryKey: [...boardAssignmentKeys.forBoard(boardId), type] as const,
      queryFn: async () => {
        const { assignments } = await apiClient.boards.listBoardAssignments(
          boardId,
          { role: type }
        );
        return assignments;
      },
    }),
  byTrainer: (trainerId: string) =>
    queryOptions({
      queryKey: boardAssignmentKeys.forTrainer(trainerId),
      queryFn: async () => {
        const { assignments } = await apiClient.boards.listBoardAssignments(
          trainerId,
          { role: "trainer" }
        );
        return assignments;
      },
    }),
  byRider: (riderId: string) =>
    queryOptions({
      queryKey: boardAssignmentKeys.forRider(riderId),
      queryFn: async () => {
        const { assignments } = await apiClient.boards.listBoardAssignments(
          riderId,
          { role: "rider" }
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

export function useBoardsForRider(params: ListBoardsForRiderRequest) {
  return useQuery(boardsOptions.forRider(params));
}

export function useRiderAssignments(riderId: string) {
  return useQuery(boardAssignmentsOptions.byRider(riderId));
}

export function useTrainerAssignments(trainerId: string) {
  return useQuery(boardAssignmentsOptions.byTrainer(trainerId));
}

export function useBoardAssignments(
  boardId: string,
  type?: "trainer" | "rider"
) {
  return useQuery(boardAssignmentsOptions.byBoard(boardId, type));
}
