import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal/types";
import { apiClient, boards } from "#client";

import { boardAssignmentKeys, boardKeys } from "./keys";

// ---- Standalone functions ----------------------------------------------

export const boardsMutations = {
  createBoard: async (request: boards.CreateBoardRequest) => {
    const { board } = await apiClient.boards.createBoard(request);
    return board;
  },
  updateBoard: async ({
    boardId,
    request,
  }: {
    boardId: string;
    request: boards.UpdateBoardRequest;
  }) => {
    const { board } = await apiClient.boards.updateBoard(boardId, request);
    return board;
  },
  deleteBoard: async (boardId: string) => {
    await apiClient.boards.deleteBoard(boardId);
  },
};

export const boardAssignmentsMutations = {
  assignToBoard: async (request: boards.AssignToBoardRequest) => {
    const { assignment } = await apiClient.boards.assignToBoard(request);
    return assignment;
  },
  removeFromBoard: async ({ assignmentId }: { assignmentId: string }) => {
    await apiClient.boards.removeFromBoard(assignmentId);
  },
};

// ---- Boards ------------------------------------------------------------

export function useCreateBoard({
  mutationConfig,
}: MutationHookOptions<typeof boardsMutations.createBoard> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(boardsMutations.createBoard, {
    ...config,
    onSuccess: (board, ...args) => {
      // Seed the byId cache with the fresh board
      queryClient.setQueryData(boardKeys.byId(board.id), board);
      // Invalidate every list variant so paginated/filtered views refetch
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      onSuccess?.(board, ...args);
    },
  });
}

export function useUpdateBoard({
  mutationConfig,
}: MutationHookOptions<typeof boardsMutations.updateBoard> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(boardsMutations.updateBoard, {
    ...config,
    onSuccess: (board, ...args) => {
      queryClient.setQueryData(boardKeys.byId(board.id), board);
      // Lists contain board summaries — invalidate them all
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      onSuccess?.(board, ...args);
    },
  });
}

export function useDeleteBoard({
  mutationConfig,
}: MutationHookOptions<typeof boardsMutations.deleteBoard> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(boardsMutations.deleteBoard, {
    ...config,
    onSuccess: (...args) => {
      // Nuke every board-related cache entry; cheapest way to stay correct
      queryClient.invalidateQueries({ queryKey: boardKeys.all() });
      onSuccess?.(...args);
    },
  });
}

// ---- Board Assignments -------------------------------------------------

export function useAssignToBoard({
  mutationConfig,
}: MutationHookOptions<typeof boardAssignmentsMutations.assignToBoard> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(boardAssignmentsMutations.assignToBoard, {
    ...config,
    onSuccess: (assignment, ...args) => {
      // An assignment change potentially changes which boards a rider/trainer
      // sees. Invalidate both domains at their root.
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: boardAssignmentKeys.all() });
      onSuccess?.(assignment, ...args);
    },
  });
}

export function useRemoveFromBoard({
  mutationConfig,
}: MutationHookOptions<typeof boardAssignmentsMutations.removeFromBoard> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(boardAssignmentsMutations.removeFromBoard, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: boardAssignmentKeys.all() });
      onSuccess?.(...args);
    },
  });
}
