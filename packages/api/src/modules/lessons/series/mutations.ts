import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal/types";
import { apiClient, type series, type types } from "#client";

import { lessonKeys } from "../keys";

// ---- Standalone functions ------------------------------------------------------------

export const lessonsMutations = {
  createLessonSeries: async (request: series.CreateLessonSeriesRequest) => {
    const { series } = await apiClient.lessons.createLessonSeries(request);
    return series;
  },

  updateLessonSeries: async ({
    seriesId,
    request,
  }: {
    seriesId: string;
    request: series.UpdateLessonSeriesRequest;
  }) => {
    const { series } = await apiClient.lessons.updateLessonSeries(
      seriesId,
      request
    );
    return series;
  },

  cancelLessonSeries: async ({
    seriesId,
    request,
  }: {
    seriesId: string;
    request: series.CancelLessonSeriesRequest;
  }) => {
    await apiClient.lessons.cancelLessonSeries(seriesId, request);
  },
};

export function useCreateLessonSeries({
  mutationConfig,
}: MutationHookOptions<typeof lessonsMutations.createLessonSeries> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(lessonsMutations.createLessonSeries, {
    ...config,
    onSuccess: (series, ...args) => {
      queryClient.setQueryData(
        lessonKeys.series(),
        (old: types.LessonSeries[] | undefined) => [...(old ?? []), series]
      );

      queryClient.invalidateQueries({ queryKey: lessonKeys.series() });
      // Invalidate instances - the backend generates them on create
      queryClient.invalidateQueries({ queryKey: lessonKeys.instances() });

      onSuccess?.(series, ...args);
    },
  });
}

export function useUpdateLessonSeries({
  mutationConfig,
}: MutationHookOptions<typeof lessonsMutations.updateLessonSeries> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(lessonsMutations.updateLessonSeries, {
    ...config,
    onSuccess: (series, ...args) => {
      queryClient.setQueryData(lessonKeys.seriesById(series.id), series);
      queryClient.invalidateQueries({ queryKey: lessonKeys.series() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.instances() });
      onSuccess?.(series, ...args);
    },
  });
}

export function useCancelLessonSeries({
  mutationConfig,
}: MutationHookOptions<typeof lessonsMutations.cancelLessonSeries> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(lessonsMutations.cancelLessonSeries, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.series() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.instances() });
      onSuccess?.(...args);
    },
  });
}
