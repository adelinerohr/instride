import { MembershipRole, WaiverStatus } from "@instride/shared";
import { generateId } from "better-auth";
import { eq } from "drizzle-orm";
import { api, APIError } from "encore.dev/api";

import {
  authMembers,
  authUsers,
  boardAssignments,
  members,
  questionnaireResponses,
  riders,
  waiverSignatures,
} from "@/database/schema";
import {
  evaluateBoardAssignmentRules,
  validateResponses,
} from "@/services/questionnaires/submit";
import {
  Questionnaire,
  QuestionnaireQuestionResponse,
} from "@/services/questionnaires/types/models";
import { Waiver } from "@/services/waivers/types/models";
import { requireAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { BaseMember } from "../types/models";

interface OnboardMemberParams {
  organizationId: string;
  user: {
    name: string;
    phone?: string | null;
    dateOfBirth?: string | null;
    image?: string | null;
    roles: MembershipRole[];
  };
  questionnaire?: {
    questionnaireId: string;
    responses: QuestionnaireQuestionResponse[];
  };
  waiver?: {
    waiverId: string;
  };
}

export const onboardMember = api(
  {
    method: "POST",
    path: "/organizations/members/onboard",
    expose: true,
    auth: true,
  },
  async (params: OnboardMemberParams): Promise<BaseMember> => {
    const { userID } = requireAuth();

    const organization = await db.query.organizations.findFirst({
      where: {
        id: params.organizationId,
      },
    });

    assertExists(organization, "Organization not found");

    if (!organization.allowPublicJoin) {
      throw APIError.permissionDenied(
        "This organization does not allow public join"
      );
    }

    // Validate questionnaire if provided
    let questionnaire: Questionnaire | undefined;
    if (params.questionnaire) {
      questionnaire = await db.query.questionnaires.findFirst({
        where: {
          id: params.questionnaire.questionnaireId,
          organizationId: organization.id,
        },
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
          organizationId: organization.id,
          status: WaiverStatus.ACTIVE,
        },
      });
      assertExists(waiver, "Active waiver not found");
    }

    const result = await db.transaction(async (tx) => {
      // 1. Update user profile
      await tx
        .update(authUsers)
        .set({
          name: params.user.name,
          phone: params.user.phone,
          dateOfBirth: params.user.dateOfBirth,
          image: params.user.image,
        })
        .where(eq(authUsers.id, userID));

      // 2. Create better auth member
      const [authMember] = await tx
        .insert(authMembers)
        .values({
          id: generateId(),
          userId: userID,
          organizationId: organization.authOrganizationId,
          role: params.user.roles.join(","),
        })
        .returning();

      // 3. Create member profile
      const [member] = await tx
        .insert(members)
        .values({
          userId: userID,
          organizationId: organization.id,
          authMemberId: authMember.id,
          roles: params.user.roles,
          onboardingComplete: true,
        })
        .returning();

      // 4. Handle rider onboarding
      if (params.user.roles.includes(MembershipRole.RIDER)) {
        // 4.1. Create rider profile
        const [rider] = await tx
          .insert(riders)
          .values({
            memberId: member.id,
            organizationId: organization.id,
            isRestricted: false,
          })
          .returning();

        // 4.2. Handle questionnaire submission
        if (questionnaire && params.questionnaire) {
          const assignedBoardIds = evaluateBoardAssignmentRules(
            questionnaire,
            params.questionnaire.responses
          );

          await tx.insert(questionnaireResponses).values({
            questionnaireId: questionnaire.id,
            questionnaireVersion: questionnaire.version,
            organizationId: organization.id,
            memberId: member.id,
            submittedByMemberId: member.id,
            completedAt: new Date(),
            responses: params.questionnaire.responses,
            assignedBoardIds,
          });

          // 4.3. Handle board assignments
          const boardAssignmentsInput = assignedBoardIds.map((boardId) => ({
            organizationId: organization.id,
            boardId,
            riderId: rider.id,
          }));

          if (boardAssignmentsInput.length > 0) {
            await tx.insert(boardAssignments).values(boardAssignmentsInput);
          }

          // 4.4. Handle waiver signature
          if (waiver && params.waiver) {
            await tx.insert(waiverSignatures).values({
              organizationId: organization.id,
              waiverId: waiver.id,
              signerMemberId: member.id,
              onBehalfOfMemberId: member.id,
              waiverVersion: waiver.version,
            });
          }
        }
      }

      return member;
    });

    return result;
  }
);
