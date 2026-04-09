import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import {
  serviceBoardAssignmentKeys,
  serviceKeys,
  serviceTrainerAssignmentKeys,
} from "./keys";

// ---- Query Options ------------------------------------------------------------

export const servicesOptions = {
  // Get all services for an organization
  all: () =>
    queryOptions({
      queryKey: serviceKeys.all(),
      queryFn: async () => {
        const { services } = await apiClient.boards.listServices({});
        return services;
      },
    }),

  // Get a service by ID
  byId: (serviceId: string) =>
    queryOptions({
      queryKey: serviceKeys.byId(serviceId),
      queryFn: async () => {
        const { service } = await apiClient.boards.getService(serviceId);
        return service;
      },
    }),

  // Get all services assigned to a trainer
  assignedToTrainer: (trainerId: string) =>
    queryOptions({
      queryKey: serviceKeys.assignedToTrainer(trainerId),
      queryFn: async () => {
        const { services } = await apiClient.boards.listServices({ trainerId });
        return services;
      },
    }),

  // Get all services assigned to a board
  assignedToBoard: (boardId: string) =>
    queryOptions({
      queryKey: serviceKeys.assignedToBoard(boardId),
      queryFn: async () => {
        const { services } = await apiClient.boards.listServices({ boardId });
        return services;
      },
    }),

  // Get all service assignments for a trainer
  trainerAssignments: (trainerId: string) =>
    queryOptions({
      queryKey: serviceTrainerAssignmentKeys.byTrainer(trainerId),
      queryFn: async () => {
        const { assignments } =
          await apiClient.boards.listTrainerServiceAssignments({ trainerId });
        return assignments;
      },
    }),

  // Get all service assignments for a board
  boardAssignments: (boardId: string) =>
    queryOptions({
      queryKey: serviceBoardAssignmentKeys.byBoard(boardId),
      queryFn: async () => {
        const { assignments } =
          await apiClient.boards.listBoardServiceAssignments({ boardId });
        return assignments;
      },
    }),

  // Get all trainer assignments for a service
  serviceTrainerAssignments: (serviceId: string) =>
    queryOptions({
      queryKey: serviceTrainerAssignmentKeys.byService(serviceId),
      queryFn: async () => {
        const { assignments } =
          await apiClient.boards.listTrainerServiceAssignments({ serviceId });
        return assignments;
      },
    }),

  // Get all board assignments for a service
  serviceBoardAssignments: (serviceId: string) =>
    queryOptions({
      queryKey: serviceBoardAssignmentKeys.byService(serviceId),
      queryFn: async () => {
        const { assignments } =
          await apiClient.boards.listBoardServiceAssignments({ serviceId });
        return assignments;
      },
    }),
};

// ---- Hooks --------------------------------------------------------------------

export function useServices() {
  return useQuery(servicesOptions.all());
}

export function useService(serviceId: string) {
  return useQuery(servicesOptions.byId(serviceId));
}

export function useTrainerServices(trainerId: string) {
  return useQuery(servicesOptions.assignedToTrainer(trainerId));
}

export function useBoardServices(boardId: string) {
  return useQuery(servicesOptions.assignedToBoard(boardId));
}

export function useServiceTrainerAssignments(trainerId: string) {
  return useQuery(servicesOptions.trainerAssignments(trainerId));
}

export function useServiceBoardAssignments(boardId: string) {
  return useQuery(servicesOptions.boardAssignments(boardId));
}

export function useTrainerAssignmentsForService(serviceId: string) {
  return useQuery(servicesOptions.serviceTrainerAssignments(serviceId));
}

export function useBoardAssignmentsForService(serviceId: string) {
  return useQuery(servicesOptions.serviceBoardAssignments(serviceId));
}
