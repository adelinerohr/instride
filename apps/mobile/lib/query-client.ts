import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 min default
      retry: (failureCount, error) => {
        if (
          error instanceof Error &&
          error.message.includes("unauthenticated")
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});
