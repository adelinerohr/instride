import { api } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";
import { memberFragment } from "@/shared/utils/fragments";
import {
  assertExists,
  assertMember,
  assertMemberWithRider,
} from "@/shared/utils/validation";

import { db } from "./db";
import {
  GuardianPermissions,
  GuardianRelationshipWithGuardian,
  GuardianRelationshipWithMembers,
} from "./types/models";

export const getRelationshipById = api(
  {
    method: "GET",
    path: "/guardians/:relationshipId",
    expose: true,
    auth: true,
  },
  async (params: {
    relationshipId: string;
  }): Promise<GuardianRelationshipWithMembers> => {
    const { organizationId } = requireOrganizationAuth();

    const relationship = await db.query.guardianRelationships.findFirst({
      where: {
        id: params.relationshipId,
        organizationId,
      },
      with: {
        dependent: memberFragment,
        guardian: memberFragment,
      },
    });

    assertExists(relationship, "Guardian relationship not found");
    assertMember(relationship.dependent, "Dependent");
    assertMember(relationship.guardian, "Guardian");

    return {
      ...relationship,
      dependent: relationship.dependent,
      guardian: relationship.guardian,
    };
  }
);

export const listAllRelationships = api(
  {
    method: "GET",
    path: "/guardians",
    expose: true,
    auth: true,
  },
  async (): Promise<{ relationships: GuardianRelationshipWithMembers[] }> => {
    const { organizationId } = requireOrganizationAuth();

    const relationships = await db.query.guardianRelationships.findMany({
      where: {
        organizationId,
      },
      with: {
        dependent: memberFragment,
        guardian: memberFragment,
      },
    });

    return {
      relationships: relationships.map((relationship) => {
        assertMember(relationship.dependent);
        assertMember(relationship.guardian);

        return {
          ...relationship,
          dependent: relationship.dependent,
          guardian: relationship.guardian,
        };
      }),
    };
  }
);

interface GetMyDependendentsResponse {
  relationships: {
    id: string;
    dependentMemberId: string;
    permissions: GuardianPermissions | null;
    createdAt: Date | string;
    dependent: {
      name: string;
      image: string | null;
      dateOfBirth: string | null;
      riderId: string;
      isRestricted: boolean;
      level: {
        id: string;
        name: string;
        color: string;
      } | null;
      boardAssignments: string[];
    };
  }[];
}

export const getMyDependents = api(
  {
    method: "GET",
    path: "/guardians/my-dependents",
    expose: true,
    auth: true,
  },
  async (): Promise<GetMyDependendentsResponse> => {
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
            rider: {
              with: {
                boardAssignments: true,
                level: true,
              },
            },
          },
        },
      },
    });

    return {
      relationships: relationships.map((relationship) => {
        assertMember(relationship.dependent);
        assertMemberWithRider(relationship.dependent);

        return {
          id: relationship.id,
          dependentMemberId: relationship.dependentMemberId,
          permissions: relationship.permissions,
          createdAt: relationship.createdAt,
          dependent: {
            id: relationship.dependent.id,
            name: relationship.dependent.authUser.name,
            dateOfBirth: relationship.dependent.authUser.dateOfBirth,
            image: relationship.dependent.authUser.image,
            riderId: relationship.dependent.rider.id,
            isRestricted: relationship.dependent.rider.isRestricted,
            ridingLevelId: relationship.dependent.rider.ridingLevelId,
            level: relationship.dependent.rider.level,
            boardAssignments: relationship.dependent.rider.boardAssignments.map(
              (assignment) => assignment.id
            ),
          },
        };
      }),
    };
  }
);

export const getMyGuardians = api(
  {
    method: "GET",
    path: "/guardians/my-guardians",
    expose: true,
    auth: true,
  },
  async (): Promise<GuardianRelationshipWithGuardian> => {
    const { organizationId } = requireOrganizationAuth();
    const { member } = await organizations.getMember();

    const relationships = await db.query.guardianRelationships.findFirst({
      where: {
        dependentMemberId: member.id,
        organizationId,
      },
      with: {
        guardian: memberFragment,
      },
    });

    assertExists(relationships, "Guardian relationship not found");
    assertMember(relationships.guardian);

    return {
      ...relationships,
      guardian: relationships.guardian,
    };
  }
);
