import { queryOptions, useQuery } from "@tanstack/react-query";

import { apiClient } from "#client";

import { activityKeys } from "./keys";

export const activityQueries = {
  listRider: (riderId: string, ownerMemberId: string) =>
    queryOptions({
      queryKey: activityKeys.listRider(riderId, ownerMemberId),
      queryFn: async () => {
        const { activities } = await apiClient.activity.listActivity({
          riderId,
          ownerMemberId,
        });
        return activities;
      },
    }),
  listTrainer: (trainerId: string, ownerMemberId: string) =>
    queryOptions({
      queryKey: activityKeys.listTrainer(trainerId, ownerMemberId),
      queryFn: async () => {
        const { activities } = await apiClient.activity.listActivity({
          trainerId,
          ownerMemberId,
        });
        return activities;
      },
    }),
};

export function useListRiderActivity(riderId: string, ownerMemberId: string) {
  return useQuery(activityQueries.listRider(riderId, ownerMemberId));
}

export function useListTrainerActivity(
  trainerId: string,
  ownerMemberId: string
) {
  return useQuery(activityQueries.listTrainer(trainerId, ownerMemberId));
}
