import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal/types";
import { apiClient, boards } from "#client";

import { boardAssignmentKeys, boardKeys } from "./keys";
import type { useBoards } from "./queries";

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
      queryClient.setQueryData(
        boardKeys.list(),
        (old: Awaited<ReturnType<typeof useBoards>["data"]>) => [
          ...(old ?? []),
          board,
        ]
      );
      queryClient.invalidateQueries({
        queryKey: boardKeys.list(),
      });
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
      queryClient.invalidateQueries({
        queryKey: boardKeys.byId(board.id),
      });
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
      queryClient.invalidateQueries({
        queryKey: boardKeys.list(),
      });
      onSuccess?.(...args);
    },
  });
}

// ---- Board Assignments ------------------------------------------------------------

export function useAssignToBoard({
  mutationConfig,
}: MutationHookOptions<typeof boardAssignmentsMutations.assignToBoard> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(boardAssignmentsMutations.assignToBoard, {
    ...config,
    onSuccess: (assignment, ...args) => {
      if (assignment.trainerId) {
        queryClient.setQueryData(
          boardKeys.assignedToTrainer(assignment.trainerId),
          assignment
        );
      } else if (assignment.riderId) {
        queryClient.setQueryData(
          boardKeys.assignedToRider(assignment.riderId),
          assignment
        );
      }
      queryClient.invalidateQueries({
        queryKey: boardKeys.list(),
      });
      queryClient.invalidateQueries({
        queryKey: boardAssignmentKeys.list(),
      });
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
    onSuccess: (assignment, ...args) => {
      queryClient.invalidateQueries({
        queryKey: boardKeys.list(),
      });
      queryClient.invalidateQueries({
        queryKey: boardAssignmentKeys.list(),
      });
      onSuccess?.(assignment, ...args);
    },
  });
}
