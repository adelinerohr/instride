import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import { authKeys } from "./keys";

export const authOptions = {
  session: () =>
    queryOptions({
      queryKey: authKeys.session,
      queryFn: () => apiClient.auth.getSession({}),
    }),
};

export function useSession() {
  return useQuery(authOptions.session());
}
