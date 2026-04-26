import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal/types";
import { apiClient } from "#client";
import {
  EnrollRidersInInstanceRequest,
  EnrollRidersInSeriesRequest,
  MarkAttendanceRequest,
  UnenrollRiderFromSeriesRequest,
} from "#contracts";

import { lessonKeys } from "../keys";

export const enrollmentsMutations = {
  enrollInSeries: async ({
    seriesId,
    ...request
  }: EnrollRidersInSeriesRequest) => {
    return await apiClient.lessons.enrollInSeries(seriesId, request);
  },
  unenrollFromSeries: async ({
    seriesId,
    ...request
  }: UnenrollRiderFromSeriesRequest) => {
    return await apiClient.lessons.unenrollRiderFromSeries(seriesId, request);
  },
  enrollInInstance: async ({
    instanceId,
    ...request
  }: EnrollRidersInInstanceRequest) => {
    return await apiClient.lessons.enrollInInstance(instanceId, request);
  },
  unenrollFromInstance: async (instanceId: string) => {
    await apiClient.lessons.unenrollFromInstance(instanceId);
  },
  markAttendance: async ({
    enrollmentId,
    ...request
  }: MarkAttendanceRequest) => {
    return await apiClient.lessons.markAttendance(enrollmentId, request);
  },
};

export function useEnrollInSeries({
  mutationConfig,
}: MutationHookOptions<typeof enrollmentsMutations.enrollInSeries> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(enrollmentsMutations.enrollInSeries, {
    ...config,
    onSuccess: (enrollment, ...args) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.series() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.instances() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.enrollments() });
      onSuccess?.(enrollment, ...args);
    },
  });
}

export function useUnenrollFromSeries({
  mutationConfig,
}: MutationHookOptions<typeof enrollmentsMutations.unenrollFromSeries> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(enrollmentsMutations.unenrollFromSeries, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.series() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.instances() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.enrollments() });
      onSuccess?.(...args);
    },
  });
}

export function useEnrollInInstance({
  mutationConfig,
}: MutationHookOptions<typeof enrollmentsMutations.enrollInInstance> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(enrollmentsMutations.enrollInInstance, {
    ...config,
    onSuccess: (enrollment, ...args) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.instances() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.enrollments() });
      onSuccess?.(enrollment, ...args);
    },
  });
}

export function useUnenrollFromInstance({
  mutationConfig,
}: MutationHookOptions<typeof enrollmentsMutations.unenrollFromInstance> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(enrollmentsMutations.unenrollFromInstance, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.instances() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.enrollments() });
      onSuccess?.(...args);
    },
  });
}

export function useMarkAttendance({
  mutationConfig,
}: MutationHookOptions<typeof enrollmentsMutations.markAttendance> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(enrollmentsMutations.markAttendance, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.enrollments() });
      onSuccess?.(...args);
    },
  });
}
