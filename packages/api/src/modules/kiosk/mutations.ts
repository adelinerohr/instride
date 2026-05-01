import { useQueryClient } from "@tanstack/react-query";

import { useWrappedMutation, type MutationHookOptions } from "#_internal";
import { apiClient } from "#client";
import {
  CheckKioskPermissionRequest,
  ClearKioskIdentityRequest,
  CreateKioskSessionRequest,
  KioskCancelLessonInstanceRequest,
  KioskCreateLessonInstanceRequest,
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

  /** Acting state identity (persistent "start acting" flow) */
  verifyIdentity: async (request: VerifyKioskIdentityRequest) => {
    return await apiClient.kiosk.verifyKioskIdentity(request);
  },
  clearIdentity: async (request: ClearKioskIdentityRequest) =>
    await apiClient.kiosk.clearKioskIdentity(request),

  /** Permission check (used by one-shot PIN auth dialog) */
  checkPermission: async (request: CheckKioskPermissionRequest) => {
    return await apiClient.kiosk.checkKioskPermission(request);
  },

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
  cancelLessonInstance: async ({
    instanceId,
    ...request
  }: KioskCancelLessonInstanceRequest) =>
    await apiClient.kiosk.kioskCancelLessonInstance(instanceId, request),
  createLessonInstance: async (request: KioskCreateLessonInstanceRequest) =>
    await apiClient.kiosk.kioskCreateLessonInstance(request),
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

/**
 * Permission check for one-shot PIN-gated actions. Does not mutate any
 * server state — verifies a PIN and confirms the action is allowed for
 * that member, returning the verified member on success.
 *
 * Despite being a "check" rather than a mutation, it uses
 * useWrappedMutation because the call is imperative (triggered by form
 * submit, not by component mount) and we want the mutation lifecycle
 * (isPending, error handling).
 *
 * No cache invalidation — this is a read-only verification.
 */
export function useCheckKioskPermission({
  mutationConfig,
}: MutationHookOptions<typeof kioskMutations.checkPermission> = {}) {
  return useWrappedMutation(kioskMutations.checkPermission, {
    ...mutationConfig,
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

export function useKioskCancelLessonInstance({
  mutationConfig,
}: MutationHookOptions<typeof kioskMutations.cancelLessonInstance> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(kioskMutations.cancelLessonInstance, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.series() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.instances() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.enrollments() });
      onSuccess?.(...args);
    },
  });
}

export function useKioskCreateLessonInstance({
  mutationConfig,
}: MutationHookOptions<typeof kioskMutations.createLessonInstance> = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...config } = mutationConfig || {};

  return useWrappedMutation(kioskMutations.createLessonInstance, {
    ...config,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.series() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.instances() });
      queryClient.invalidateQueries({ queryKey: lessonKeys.enrollments() });
      onSuccess?.(...args);
    },
  });
}
