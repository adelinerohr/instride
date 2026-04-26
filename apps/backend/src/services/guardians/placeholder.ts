import {
  defaultPermissions,
  Waiver,
  type CreatePlaceholderRelationshipRequest,
  type MutateGuardianRelationshipResponse,
  type Questionnaire,
} from "@instride/api/contracts";
import {
  GuardianRelationshipStatus,
  MembershipRole,
  WaiverStatus,
} from "@instride/shared";
import { generateId } from "better-auth";
import { api, APIError } from "encore.dev/api";

import { authUsers } from "@/services/auth/schema";
import { boardAssignments } from "@/services/boards/schema";
import { authMembers, members, riders } from "@/services/organizations/schema";
import { questionnaireResponses } from "@/services/questionnaires/schema";
import {
  evaluateBoardAssignmentRules,
  validateResponses,
} from "@/services/questionnaires/submit";
import { waiverSignatures } from "@/services/waivers/schema";
import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";
import { toGuardianRelationship } from "./mappers";
import { guardianRelationships } from "./schema";

export const createPlaceholderRelationship = api(
  {
    method: "POST",
    path: "/guardians/placeholder",
    expose: true,
    auth: true,
  },
  async (
    params: CreatePlaceholderRelationshipRequest
  ): Promise<MutateGuardianRelationshipResponse> => {
    const { organizationId, userID: guardianUserId } =
      requireOrganizationAuth();

    const organization = await db.query.organizations.findFirst({
      where: { id: organizationId },
    });
    assertExists(organization, "Organization not found");

    const guardianMember = await db.query.members.findFirst({
      where: { userId: guardianUserId, organizationId },
    });
    assertExists(guardianMember, "Guardian member not found");

    if (!guardianMember.roles.includes(MembershipRole.GUARDIAN)) {
      throw APIError.permissionDenied("Only guardians can create dependents");
    }

    if (params.placeholderProfile.email) {
      const existing = await db.query.authUsers.findFirst({
        where: { email: params.placeholderProfile.email },
      });
      if (existing) {
        throw APIError.alreadyExists(
          "A user with this email already exists. Use the invite flow instead."
        );
      }
    }

    let questionnaire: Questionnaire | undefined;
    if (params.questionnaire) {
      questionnaire = await db.query.questionnaires.findFirst({
        where: { id: params.questionnaire.questionnaireId, organizationId },
      });
      assertExists(questionnaire, "Questionnaire not found");
      validateResponses(params.questionnaire.responses as never, questionnaire);
    }

    let waiver: Waiver | undefined;
    if (params.waiver) {
      waiver = await db.query.waivers.findFirst({
        where: {
          id: params.waiver.waiverId,
          organizationId,
          status: WaiverStatus.ACTIVE,
        },
      });
      assertExists(waiver, "Active waiver not found");
    }

    const permissions = {
      ...defaultPermissions,
      ...params.permissions,
    };

    const now = new Date();
    const placeholderEmail =
      params.placeholderProfile.email ??
      `dependent+${crypto.randomUUID()}@placeholder.instride.local`;

    const relationship = await db.transaction(async (tx) => {
      const [authUser] = await tx
        .insert(authUsers)
        .values({
          id: generateId(),
          email: placeholderEmail,
          name: params.placeholderProfile.name,
          emailVerified: false,
          image: params.placeholderProfile.image ?? null,
          createdAt: now,
          updatedAt: now,
          dateOfBirth: params.placeholderProfile.dateOfBirth,
          phone: params.placeholderProfile.phone ?? null,
        })
        .returning();

      const [authMember] = await tx
        .insert(authMembers)
        .values({
          id: generateId(),
          userId: authUser.id,
          organizationId: organization.authOrganizationId,
        })
        .returning();

      const [member] = await tx
        .insert(members)
        .values({
          userId: authUser.id,
          organizationId,
          roles: [MembershipRole.RIDER],
          authMemberId: authMember.id,
          isPlaceholder: true,
          onboardingComplete: false,
        })
        .returning();

      const [rider] = await tx
        .insert(riders)
        .values({
          memberId: member.id,
          organizationId,
          isRestricted: true,
        })
        .returning();

      const [created] = await tx
        .insert(guardianRelationships)
        .values({
          organizationId,
          guardianMemberId: guardianMember.id,
          dependentMemberId: member.id,
          status: GuardianRelationshipStatus.ACTIVE,
          permissions,
          coppaConsentGiven: true,
          coppaConsentGivenAt: now,
        })
        .returning();

      if (questionnaire && params.questionnaire) {
        const assignedBoardIds = evaluateBoardAssignmentRules(
          questionnaire,
          params.questionnaire.responses as never
        );

        await tx.insert(questionnaireResponses).values({
          questionnaireId: questionnaire.id,
          questionnaireVersion: questionnaire.version,
          organizationId,
          memberId: member.id,
          submittedByMemberId: guardianMember.id,
          completedAt: now,
          responses: params.questionnaire.responses as never,
          assignedBoardIds,
        });

        const boardAssignmentsInput = assignedBoardIds.map((boardId) => ({
          organizationId,
          boardId,
          riderId: rider.id,
        }));

        if (boardAssignmentsInput.length > 0) {
          await tx.insert(boardAssignments).values(boardAssignmentsInput);
        }
      }

      if (waiver && params.waiver) {
        await tx.insert(waiverSignatures).values({
          organizationId,
          waiverId: waiver.id,
          signerMemberId: guardianMember.id,
          onBehalfOfMemberId: member.id,
          waiverVersion: waiver.version,
        });
      }

      return created;
    });

    return { relationship: toGuardianRelationship(relationship) };
  }
);
