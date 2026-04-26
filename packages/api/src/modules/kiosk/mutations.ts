import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal";
import { apiClient } from "#client";
import {
  ClearKioskIdentityRequest,
  CreateKioskSessionRequest,
  KioskEnrollInInstanceRequest,
  KioskMarkAttendanceRequest,
  KioskUnenrollFromInstanceRequest,
  UpdateKioskSessionRequest,
  VerifyKioskIdentityRequest,
} from "#contracts";
import { lessonKeys } from "#modules/lessons/keys";

import { kioskKeys } from "./keys";

export const kioskMutations = {
  /** Sessions */
  createSession: async (request: CreateKioskSessionRequest) => {
    const { session } = await apiClient.kiosk.createKioskSession(request);
    return session;
  },
  updateSession: async ({
    sessionId,
    ...request
  }: UpdateKioskSessionRequest) => {
    const { session } = await apiClient.kiosk.updateKioskSession(
      sessionId,
      request
    );
    return session;
  },
  deleteSession: async (sessionId: string) =>
    await apiClient.kiosk.deleteKioskSession(sessionId),

  /** Acting state identity */
  verifyIdentity: async (request: VerifyKioskIdentityRequest) => {
    return await apiClient.kiosk.verifyKioskIdentity(request);
  },
  clearIdentity: async (request: ClearKioskIdentityRequest) =>
    await apiClient.kiosk.clearKioskIdentity(request),

  /** Actions */
  markAttendance: async ({
    enrollmentId,
    ...request
  }: KioskMarkAttendanceRequest) => {
    return await apiClient.kiosk.kioskMarkAttendance(enrollmentId, request);
  },
  enrollInInstance: async ({
    instanceId,
    ...request
  }: KioskEnrollInInstanceRequest) =>
    await apiClient.kiosk.kioskEnrollInInstance(instanceId, request),
  unenrollFromInstance: async ({
    enrollmentId,
    ...request
  }: KioskUnenrollFromInstanceRequest) =>
    await apiClient.kiosk.kioskUnenrollFromInstance(enrollmentId, request),
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
