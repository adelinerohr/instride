import { GuardianRelationshipStatus } from "@instride/shared";
import { api, APIError } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { db } from "@/database";
import { requireOrganizationAuth } from "@/shared/auth";

import {
  GetGuardianRelationshipResponse,
  ListGuardianRelationshipsResponse,
} from "./types/contracts";

export const getRelationshipById = api(
  {
    method: "GET",
    path: "/guardians/:relationshipId",
    expose: true,
    auth: true,
  },
  async ({
    relationshipId,
  }: {
    relationshipId: string;
  }): Promise<GetGuardianRelationshipResponse> => {
    const relationship = await db.query.guardianRelationships.findFirst({
      where: { id: relationshipId },
      with: {
        dependent: {
          with: {
            authUser: true,
          },
        },
      },
    });
    if (!relationship) {
      throw APIError.notFound("Guardian relationship not found");
    }
    return { relationship };
  }
);

export const listAllRelationships = api(
  {
    method: "GET",
    path: "/guardians",
    expose: true,
    auth: true,
  },
  async (): Promise<ListGuardianRelationshipsResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const relationships = await db.query.guardianRelationships.findMany({
      where: {
        organizationId,
      },
      with: {
        dependent: {
          with: {
            authUser: true,
          },
        },
      },
    });
    return { relationships };
  }
);

export const getGuardianRelationships = api(
  {
    method: "GET",
    path: "/guardians/relationships/:guardianMemberId",
    expose: true,
    auth: true,
  },
  async ({
    guardianMemberId,
  }: {
    guardianMemberId: string;
  }): Promise<ListGuardianRelationshipsResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const relationships = await db.query.guardianRelationships.findMany({
      where: {
        guardianMemberId,
        organizationId,
      },
      with: {
        dependent: {
          with: {
            authUser: true,
          },
        },
      },
    });
    return { relationships };
  }
);

export const getMyDependents = api(
  {
    method: "GET",
    path: "/guardians/my-dependents",
    expose: true,
    auth: true,
  },
  async (): Promise<ListGuardianRelationshipsResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const relationships = await db.query.guardianRelationships.findMany({
      where: {
        guardianMemberId: member.id,
        organizationId,
      },
      with: {
        dependent: {
          with: {
            authUser: true,
          },
        },
      },
    });

    return { relationships };
  }
);

export const getMyGuardians = api(
  {
    method: "GET",
    path: "/guardians/my-guardians",
    expose: true,
    auth: true,
  },
  async (): Promise<ListGuardianRelationshipsResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const relationships = await db.query.guardianRelationships.findMany({
      where: {
        dependentMemberId: member.id,
        organizationId,
      },
    });

    return { relationships };
  }
);

export const listPendingGuardianRequests = api(
  {
    method: "GET",
    path: "/guardians/pending",
    expose: true,
    auth: true,
  },
  async (): Promise<ListGuardianRelationshipsResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const relationships = await db.query.guardianRelationships.findMany({
      where: {
        organizationId,
        status: GuardianRelationshipStatus.PENDING,
      },
    });

    return { relationships };
  }
);
