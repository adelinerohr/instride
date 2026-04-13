import { APIError, ErrCode } from "@instride/api";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: (failureCount, error) => {
        if (
          error instanceof APIError &&
          error.code === ErrCode.Unauthenticated
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});
