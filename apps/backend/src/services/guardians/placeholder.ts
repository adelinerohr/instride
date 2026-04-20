import {
  GuardianRelationshipStatus,
  MembershipRole,
  WaiverStatus,
} from "@instride/shared";
import { generateId } from "better-auth";
import { api, APIError } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { authUsers } from "../auth/schema";
import { boardAssignments } from "../boards/schema";
import { authMembers, members, riders } from "../organizations/schema";
import { questionnaireResponses } from "../questionnaires/schema";
import {
  evaluateBoardAssignmentRules,
  validateResponses,
} from "../questionnaires/submit";
import {
  Questionnaire,
  QuestionnaireQuestionResponse,
} from "../questionnaires/types/models";
import { waiverSignatures } from "../waivers/schema";
import { Waiver } from "../waivers/types/models";
import { db } from "./db";
import { guardianRelationships } from "./schema";
import {
  defaultPermissions,
  type GuardianPermissions,
  type GuardianRelationship,
} from "./types/models";

interface CreatePlaceholderRelationshipParams {
  placeholderProfile: {
    name: string;
    email?: string;
    phone?: string | null;
    image?: string | null;
    dateOfBirth: string;
  };
  permissions: Partial<GuardianPermissions>;
  questionnaire?: {
    questionnaireId: string;
    responses: QuestionnaireQuestionResponse[];
  };
  waiver?: {
    waiverId: string;
  };
}

export const createPlaceholderRelationship = api(
  {
    method: "POST",
    path: "/guardians/placeholder",
    expose: true,
    auth: true,
  },
  async (
    params: CreatePlaceholderRelationshipParams
  ): Promise<GuardianRelationship> => {
    const { organizationId, userID: guardianUserId } =
      requireOrganizationAuth();

    const organization = await db.query.organizations.findFirst({
      where: {
        id: organizationId,
      },
    });
    assertExists(organization, "Organization not found");

    // Look up guardian's member record in this org
    const guardianMember = await db.query.members.findFirst({
      where: {
        userId: guardianUserId,
        organizationId,
      },
    });
    assertExists(guardianMember, "Guardian member not found");

    if (!guardianMember.roles.includes(MembershipRole.GUARDIAN)) {
      throw APIError.permissionDenied("Only guardians can create dependents");
    }

    // Email collision check (before entering transaction)
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

    // Validate questionnaire if provided
    let questionnaire: Questionnaire | undefined;
    if (params.questionnaire) {
      questionnaire = await db.query.questionnaires.findFirst({
        where: { id: params.questionnaire.questionnaireId, organizationId },
      });
      assertExists(questionnaire, "Questionnaire not found");
      validateResponses(params.questionnaire.responses, questionnaire);
    }

    // Validate waiver if provided
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
      // 1. Create auth user row directly (Better Auth's createUser requires
      // admin, which the guardian isn't; this is a trusted domain operation)
      const [authUser] = await tx
        .insert(authUsers)
        .values({
          id: generateId(), // matches Better Auth's default generation
          email: placeholderEmail,
          name: params.placeholderProfile.name,
          emailVerified: false,
          image: params.placeholderProfile.image ?? null,
          createdAt: now,
          updatedAt: now,
          // Better Auth additional fields from your config
          dateOfBirth: params.placeholderProfile.dateOfBirth,
          phone: params.placeholderProfile.phone ?? null,
        })
        .returning();

      // 2. Create member profiles
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
          isPlaceholder: true, // Placeholder members can't log in
          onboardingComplete: true,
        })
        .returning();

      // 3. Create rider profile
      const [rider] = await tx
        .insert(riders)
        .values({
          memberId: member.id,
          organizationId,
          isRestricted: true,
        })
        .returning();

      // 4. Create guardian relationship
      const [relationship] = await tx
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

      // 5. Submit questionnaire responses (if one was provided)
      if (questionnaire && params.questionnaire) {
        const assignedBoardIds = evaluateBoardAssignmentRules(
          questionnaire,
          params.questionnaire.responses
        );

        await tx.insert(questionnaireResponses).values({
          questionnaireId: questionnaire.id,
          questionnaireVersion: questionnaire.version,
          organizationId,
          memberId: member.id,
          submittedByMemberId: guardianMember.id,
          completedAt: now,
          responses: params.questionnaire.responses,
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

      // 6. Sign waiver (if one was provided)
      if (waiver && params.waiver) {
        await tx.insert(waiverSignatures).values({
          organizationId,
          waiverId: waiver.id,
          signerMemberId: guardianMember.id,
          onBehalfOfMemberId: member.id,
          waiverVersion: waiver.version,
        });
      }

      return relationship;
    });

    return relationship;
  }
);
