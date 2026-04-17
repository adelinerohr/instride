import { api, APIError } from "encore.dev/api";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import {
  GetMemberResponse,
  GetRiderResponse,
  ListRidersResponse,
  GetTrainerResponse,
  ListMembersResponse,
  ListTrainersResponse,
} from "../types/contracts";

// ------------------------------------------------------------
// Base Members
// ------------------------------------------------------------

export const listMembers = api(
  {
    expose: true,
    method: "GET",
    path: "/members",
    auth: true,
  },
  async (): Promise<ListMembersResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const organization = await db.query.organizations.findFirst({
      where: { id: organizationId },
    });

    if (!organization) {
      throw APIError.notFound(`Organization "${organizationId}" not found`);
    }

    const members = await db.query.members.findMany({
      where: {
        organizationId: organization.id,
      },
      with: {
        authUser: true,
        trainer: true,
        rider: true,
      },
    });

    return { members };
  }
);

export const getMember = api(
  {
    expose: true,
    method: "GET",
    path: "/members/me",
    auth: true,
  },
  async (): Promise<GetMemberResponse> => {
    const { userID, organizationId } = requireOrganizationAuth();
    const member = await db.query.members.findFirst({
      where: { userId: userID, organizationId },
      with: {
        trainer: true,
        rider: true,
      },
    });
    if (!member) {
      throw APIError.notFound("Membership not found");
    }
    return { member };
  }
);

export const getMemberById = api(
  {
    expose: true,
    method: "GET",
    path: "/members/:memberId",
    auth: true,
  },
  async ({ memberId }: { memberId: string }): Promise<GetMemberResponse> => {
    const member = await db.query.members.findFirst({
      where: { id: memberId },
      with: {
        authUser: true,
        trainer: true,
        rider: true,
      },
    });

    if (!member) {
      throw APIError.notFound("Membership not found");
    }

    return { member };
  }
);

// ------------------------------------------------------------
// Trainers
// ------------------------------------------------------------

interface ListTrainersRequest {
  boardId?: string;
}

export const listTrainers = api(
  {
    expose: true,
    method: "GET",
    path: "/trainers",
    auth: true,
  },
  async (request: ListTrainersRequest): Promise<ListTrainersResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const trainers = await db.query.trainers.findMany({
      where: {
        organizationId,
        ...(request.boardId
          ? { boardAssignments: { boardId: request.boardId } }
          : {}),
      },
      with: {
        member: {
          with: {
            authUser: true,
          },
        },
        boardAssignments: {
          with: {
            board: true,
          },
        },
      },
    });

    return { trainers };
  }
);

export const getTrainer = api(
  {
    expose: true,
    method: "GET",
    path: "/trainers/:trainerId",
    auth: true,
  },
  async ({ trainerId }: { trainerId: string }): Promise<GetTrainerResponse> => {
    const trainer = await db.query.trainers.findFirst({
      where: { id: trainerId },
      with: {
        member: {
          with: {
            authUser: true,
          },
        },
      },
    });

    if (!trainer) {
      throw APIError.notFound("Trainer not found");
    }

    return { trainer };
  }
);

// ------------------------------------------------------------
// Riders
// ------------------------------------------------------------

export const listRiders = api(
  {
    expose: true,
    method: "GET",
    path: "/riders",
    auth: true,
  },
  async (): Promise<ListRidersResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const riders = await db.query.riders.findMany({
      where: { organizationId },
      with: {
        member: {
          with: {
            authUser: true,
          },
        },
        boardAssignments: {
          with: {
            board: true,
          },
        },
        level: true,
      },
    });

    return { riders };
  }
);

export const getRider = api(
  {
    expose: true,
    method: "GET",
    path: "/riders/:riderId",
    auth: true,
  },
  async ({ riderId }: { riderId: string }): Promise<GetRiderResponse> => {
    const rider = await db.query.riders.findFirst({
      where: { id: riderId },
      with: {
        member: {
          with: {
            authUser: true,
          },
        },
        level: true,
      },
    });

    if (!rider) {
      throw APIError.notFound("Rider not found");
    }

    return { rider };
  }
);
