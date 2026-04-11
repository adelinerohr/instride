import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal/types";
import { apiClient, type services } from "#client";

import { serviceKeys } from "./keys";

// ---- Standalone functions ----------------------------------------------

export const servicesMutations = {
  createService: async ({
    request,
  }: {
    request: services.CreateServiceRequest;
  }) => {
    return await apiClient.boards.createService(request);
  },

  updateService: async ({
    serviceId,
    request,
  }: {
    serviceId: string;
    request: services.UpdateServiceRequest;
  }) => {
    return await apiClient.boards.updateService(serviceId, request);
  },

  deleteService: async (serviceId: string) => {
    return await apiClient.boards.deleteService(serviceId);
  },

  assignToService: async (request: services.AssignToServiceRequest) => {
    return await apiClient.boards.assignToService(request);
  },

  unassignFromService: async ({
    assignmentId,
    request,
  }: {
    assignmentId: string;
    request: services.UnassignFromServiceRequest;
  }) => {
    return await apiClient.boards.unassignFromService(assignmentId, request);
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

export function useAssignToService({
  mutationConfig,
}: MutationHookOptions<typeof servicesMutations.assignToService> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(servicesMutations.assignToService, {
    ...config,
    onSuccess: (assignment, ...args) => {
      queryClient.invalidateQueries({
        queryKey: serviceKeys.byId(assignment.assignment.serviceId),
      });
      onSuccess?.(assignment, ...args);
    },
  });
}

export function useUnassignFromService({
  mutationConfig,
}: MutationHookOptions<typeof servicesMutations.unassignFromService> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(servicesMutations.unassignFromService, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: serviceKeys.all(),
      });
      onSuccess?.(...args);
    },
  });
}
