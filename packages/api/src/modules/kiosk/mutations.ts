import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal";
import { apiClient, kiosk, lessons } from "#client";
import { lessonKeys } from "#modules/lessons/keys";

import { kioskKeys } from "./keys";

export const kioskMutations = {
  /** Sessions */
  createSession: async (request: kiosk.CreateKioskSessionRequest) =>
    await apiClient.kiosk.createKioskSession(request),
  updateSession: async (input: {
    sessionId: string;
    request: kiosk.UpdateKioskSessionRequest;
  }) =>
    await apiClient.kiosk.updateKioskSession(input.sessionId, input.request),
  deleteSession: async (sessionId: string) =>
    await apiClient.kiosk.deleteKioskSession(sessionId),

  /** Acting state identity */
  verifyIdentity: async (request: kiosk.VerifyKioskIdentityRequest) =>
    await apiClient.kiosk.verifyKioskIdentity(request),
  clearIdentity: async (request: kiosk.ClearKioskIdentityRequest) =>
    await apiClient.kiosk.clearKioskIdentity(request),

  /** Actions */
  markAttendance: async (input: {
    enrollmentId: string;
    request: lessons.KioskMarkAttendanceRequest;
  }) =>
    await apiClient.kiosk.kioskMarkAttendance(
      input.enrollmentId,
      input.request
    ),
  enrollInInstance: async (input: {
    instanceId: string;
    request: lessons.KioskEnrollInInstanceRequest;
  }) =>
    await apiClient.kiosk.kioskEnrollInInstance(
      input.instanceId,
      input.request
    ),
  unenrollFromInstance: async (input: {
    enrollmentId: string;
    request: lessons.KioskUnenrollFromInstanceRequest;
  }) =>
    await apiClient.kiosk.kioskUnenrollFromInstance(
      input.enrollmentId,
      input.request
    ),
};

export function useCreateKioskSession({
  mutationConfig,
}: MutationHookOptions<typeof kioskMutations.createSession> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(kioskMutations.createSession, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: kioskKeys.sessions() });
      onSuccess?.(...args);
    },
  });
}

export function useUpdateKioskSession({
  mutationConfig,
}: MutationHookOptions<typeof kioskMutations.updateSession> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(kioskMutations.updateSession, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: kioskKeys.sessions() });
      onSuccess?.(...args);
    },
  });
}

export function useDeleteKioskSession({
  mutationConfig,
}: MutationHookOptions<typeof kioskMutations.deleteSession> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(kioskMutations.deleteSession, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: kioskKeys.sessions() });
      onSuccess?.(...args);
    },
  });
}

export function useVerifyKioskIdentity({
  mutationConfig,
}: MutationHookOptions<typeof kioskMutations.verifyIdentity> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(kioskMutations.verifyIdentity, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: kioskKeys.sessions() });
      onSuccess?.(...args);
    },
  });
}

export function useClearKioskIdentity({
  mutationConfig,
}: MutationHookOptions<typeof kioskMutations.clearIdentity> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(kioskMutations.clearIdentity, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: kioskKeys.sessions() });
      onSuccess?.(...args);
    },
  });
}

export function useKioskMarkAttendance({
  mutationConfig,
}: MutationHookOptions<typeof kioskMutations.markAttendance> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(kioskMutations.markAttendance, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.enrollments() });
      onSuccess?.(...args);
    },
  });
}

export function useKioskEnrollInInstance({
  mutationConfig,
}: MutationHookOptions<typeof kioskMutations.enrollInInstance> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(kioskMutations.enrollInInstance, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.series() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.instances() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.enrollments() });
      onSuccess?.(...args);
    },
  });
}

export function useKioskUnenrollFromInstance({
  mutationConfig,
}: MutationHookOptions<typeof kioskMutations.unenrollFromInstance> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(kioskMutations.unenrollFromInstance, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.series() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.instances() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.enrollments() });
      onSuccess?.(...args);
    },
  });
}
