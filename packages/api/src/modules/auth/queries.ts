import { queryOptions, useQuery } from "@tanstack/react-query";

import { STALE } from "#_internal";
import { apiClient } from "#client";

import { authKeys } from "./keys";

export const authOptions = {
  session: () =>
    queryOptions({
      queryKey: authKeys.session,
      queryFn: () => apiClient.auth.getSession(),
      staleTime: STALE.MINUTES.FIFTEEN,
    }),
};

export function useSession() {
  return useQuery(authOptions.session());
}
