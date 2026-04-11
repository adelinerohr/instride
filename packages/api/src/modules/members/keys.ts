/**
 * Key Hierarchy:
 *   ["members", orgId]                               ← nuke everything
 *   ["members", orgId, memberId]                     ← one member
 *   ["members", orgId, "me"]                         ← current user's membership
 *   ["members", orgId, "riders"]                     ← all riders
 *   ["members", orgId, "riders", riderId]            ← one rider
 *   ["members", orgId, "trainers"]                   ← all trainers
 *   ["members", orgId, "trainers", trainerId]        ← one trainer
 */

import type { members } from "#client";

const getMemberRootKey = ["members"] as const;
const getRiderRootKey = [...getMemberRootKey, "riders"] as const;
const getTrainerRootKey = [...getMemberRootKey, "trainers"] as const;

export const memberKeys = {
  list: () => getMemberRootKey,
  byId: (memberId: string) => [...getMemberRootKey, memberId] as const,
  me: () => [...getMemberRootKey, "me"] as const,

  // Trainers
  trainers: (params?: members.ListTrainersRequest) =>
    [getTrainerRootKey, params] as const,
  trainerById: (trainerId: string) =>
    [...getTrainerRootKey, trainerId] as const,

  // Riders
  riders: () => getRiderRootKey,
  riderById: (riderId: string) => [...getRiderRootKey, riderId] as const,
};
