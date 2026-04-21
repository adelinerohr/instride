import { useQueryClient } from "@tanstack/react-query";

import type { MutationHookOptions } from "#_internal";
import { useWrappedMutation } from "#_internal";
import { apiClient, type events } from "#client";

import { eventKeys } from "./keys";

export const eventMutations = {
  create: async (request: events.UpsertEventRequest) =>
    await apiClient.events.createEvent(request),
  update: async (input: { id: string; request: events.UpsertEventRequest }) =>
    await apiClient.events.updateEvent(input.id, input.request),
  delete: async (id: string) => await apiClient.events.deleteEvent(id),
};

export function useCreateEvent({
  mutationConfig,
}: MutationHookOptions<typeof eventMutations.create> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(eventMutations.create, {
    ...config,
    onSuccess: (response, ...args) => {
      queryClient.removeQueries({
        queryKey: eventKeys.byId(response.event.id),
      });
      queryClient.invalidateQueries({
        queryKey: eventKeys.all(),
      });
      onSuccess?.(response, ...args);
    },
  });
}

export function useUpdateEvent({
  mutationConfig,
}: MutationHookOptions<typeof eventMutations.update> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(eventMutations.update, {
    ...config,
    onSuccess: (response, ...args) => {
      queryClient.setQueryData(
        eventKeys.byId(response.event.id),
        response.event
      );
      queryClient.invalidateQueries({ queryKey: eventKeys.all() });
      onSuccess?.(response, ...args);
    },
  });
}

export function useDeleteEvent({
  mutationConfig,
}: MutationHookOptions<typeof eventMutations.delete> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(eventMutations.delete, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.all(),
      });
      onSuccess?.(...args);
    },
  });
}
