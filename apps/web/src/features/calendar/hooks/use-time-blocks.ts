import { serverClient } from "@instride/server-client";
import type { CreateTimeBlockRequest } from "@instride/shared";
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";

export const timeBlocksQueryOptions = (
  organizationId: string,
  from: string,
  to: string
) =>
  queryOptions({
    queryKey: queryKeys.timeBlocks.byDateRange(organizationId, from, to),
    queryFn: async () => {
      const { timeBlocks } =
        await serverClient.availability.listTimeBlocksForDateRange(
          organizationId,
          {
            from,
            to,
          }
        );
      return timeBlocks;
    },
  });

export function useTimeBlocks(
  organizationId: string,
  from: string,
  to: string
) {
  return useQuery(timeBlocksQueryOptions(organizationId, from, to));
}

export function useCreateTimeBlock(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      request,
      trainerMemberId,
    }: {
      request: CreateTimeBlockRequest;
      trainerMemberId: string;
    }) => {
      const { timeBlock } = await serverClient.availability.createTimeBlock(
        organizationId,
        trainerMemberId,
        { request }
      );
      return timeBlock;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.timeBlocks.list(organizationId),
      });
    },
  });
}

export function useDeleteTimeBlock() {
  return useMutation({
    mutationFn: (id: string) => serverClient.availability.deleteTimeBlock(id),
  });
}
