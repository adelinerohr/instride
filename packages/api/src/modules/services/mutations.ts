import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal/types";
import { apiClient } from "#client";
import {
  AssignBoardToServiceRequest,
  AssignTrainerToServiceRequest,
  CreateServiceRequest,
  UpdateServiceRequest,
} from "#contracts";

import {
  serviceBoardAssignmentKeys,
  serviceKeys,
  serviceTrainerAssignmentKeys,
} from "./keys";

// ---- Standalone functions ----------------------------------------------

export const servicesMutations = {
  createService: async (request: CreateServiceRequest) => {
    return await apiClient.boards.createService(request);
  },

  updateService: async ({ id, ...request }: UpdateServiceRequest) => {
    return await apiClient.boards.updateService(id, request);
  },

  deleteService: async (serviceId: string) => {
    return await apiClient.boards.deleteService(serviceId);
  },

  assignBoardToService: async (request: AssignBoardToServiceRequest) => {
    return await apiClient.boards.assignBoardToService(request);
  },

  assignTrainerToService: async (request: AssignTrainerToServiceRequest) => {
    return await apiClient.boards.assignTrainerToService(request);
  },

  unassignBoardFromService: async (assignmentId: string) => {
    return await apiClient.boards.unassignBoardFromService(assignmentId);
  },

  unassignTrainerFromService: async (assignmentId: string) => {
    return await apiClient.boards.unassignTrainerFromService(assignmentId);
  },
};

// ---- Services ------------------------------------------------------------

export function useCreateService({
  mutationConfig,
}: MutationHookOptions<typeof servicesMutations.createService> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(servicesMutations.createService, {
    ...config,
    onSuccess: (service, ...args) => {
      queryClient.invalidateQueries({
        queryKey: serviceKeys.all(),
      });
      onSuccess?.(service, ...args);
    },
  });
}

export function useUpdateService({
  mutationConfig,
}: MutationHookOptions<typeof servicesMutations.updateService> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(servicesMutations.updateService, {
    ...config,
    onSuccess: (service, ...args) => {
      queryClient.setQueryData(
        serviceKeys.byId(service.service.id),
        service.service
      );
      queryClient.invalidateQueries({
        queryKey: serviceKeys.byId(service.service.id),
      });
      onSuccess?.(service, ...args);
    },
  });
}

export function useDeleteService({
  mutationConfig,
}: MutationHookOptions<typeof servicesMutations.deleteService> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(servicesMutations.deleteService, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: serviceKeys.all(),
      });
      onSuccess?.(...args);
    },
  });
}

// ---- Service Assignments ------------------------------------------------------------

export function useAssignBoardToService({
  mutationConfig,
}: MutationHookOptions<typeof servicesMutations.assignBoardToService> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(servicesMutations.assignBoardToService, {
    ...config,
    onSuccess: (assignment, ...args) => {
      queryClient.invalidateQueries({
        queryKey: serviceKeys.byId(assignment.assignment.serviceId),
      });
      queryClient.invalidateQueries({
        queryKey: serviceTrainerAssignmentKeys.all(),
      });
      queryClient.invalidateQueries({
        queryKey: serviceBoardAssignmentKeys.all(),
      });
      onSuccess?.(assignment, ...args);
    },
  });
}

export function useAssignTrainerToService({
  mutationConfig,
}: MutationHookOptions<typeof servicesMutations.assignTrainerToService> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(servicesMutations.assignTrainerToService, {
    ...config,
    onSuccess: (assignment, ...args) => {
      queryClient.invalidateQueries({
        queryKey: serviceKeys.byId(assignment.assignment.serviceId),
      });
      queryClient.invalidateQueries({
        queryKey: serviceTrainerAssignmentKeys.all(),
      });
      queryClient.invalidateQueries({
        queryKey: serviceBoardAssignmentKeys.all(),
      });
      onSuccess?.(assignment, ...args);
    },
  });
}

export function useUnassignBoardFromService({
  mutationConfig,
}: MutationHookOptions<
  typeof servicesMutations.unassignBoardFromService
> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(servicesMutations.unassignBoardFromService, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: serviceKeys.all(),
      });
      onSuccess?.(...args);
    },
  });
}

export function useUnassignTrainerFromService({
  mutationConfig,
}: MutationHookOptions<
  typeof servicesMutations.unassignTrainerFromService
> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(servicesMutations.unassignTrainerFromService, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: serviceKeys.all(),
      });
      onSuccess?.(...args);
    },
  });
}
