import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import { kioskKeys } from "./keys";

export const kioskOptions = {
  sessions: () =>
    queryOptions({
      queryKey: kioskKeys.sessions(),
      queryFn: async () => await apiClient.kiosk.listKioskSessions(),
      select: (data) => data.sessions,
    }),

  session: (sessionId: string) =>
    queryOptions({
      queryKey: kioskKeys.session(sessionId),
      queryFn: async () => await apiClient.kiosk.getKioskSession(sessionId),
      enabled: !!sessionId,
      refetchInterval: 10_000, // Poll every 10s to keep acting state fresh
    }),
};

export const useKioskSessions = () => {
  return useQuery(kioskOptions.sessions());
};

export const useKioskSession = (sessionId: string | null) => {
  return useQuery({
    ...kioskOptions.session(sessionId!),
    enabled: !!sessionId,
  });
};
