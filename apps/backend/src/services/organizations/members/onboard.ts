import type {
  GetMemberResponse,
  Questionnaire,
  QuestionnaireQuestionResponse,
  RiderProfile,
  Waiver,
} from "@instride/api/contracts";
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
import { requireAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";

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
  async (params: OnboardMemberParams): Promise<GetMemberResponse> => {
    const { userID } = requireAuth();

    const organization = await db.query.organizations.findFirst({
      where: { id: params.organizationId },
    });
    assertExists(organization, "Organization not found");

    if (!organization.allowPublicJoin) {
      throw APIError.permissionDenied(
        "This organization does not allow public join"
      );
    }

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
      const [authUser] = await tx
        .update(authUsers)
        .set({
          name: params.user.name,
          phone: params.user.phone,
          dateOfBirth: params.user.dateOfBirth,
          image: params.user.image,
        })
        .where(eq(authUsers.id, userID))
        .returning();

      // 2. Create Better Auth member
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

      let riderProfile: RiderProfile | null = null;

      if (params.user.roles.includes(MembershipRole.RIDER)) {
        const [rider] = await tx
          .insert(riders)
          .values({
            memberId: member.id,
            organizationId: organization.id,
            isRestricted: false,
          })
          .returning();
        riderProfile = rider;

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

          if (assignedBoardIds.length > 0) {
            await tx.insert(boardAssignments).values(
              assignedBoardIds.map((boardId) => ({
                organizationId: organization.id,
                boardId,
                riderId: rider.id,
              }))
            );
          }

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

      return { member, authUser, riderProfile };
    });

    assertExists(result.authUser, "Member has no auth user");

    return {
      member: {
        ...result.member,
        authUser: result.authUser,
        rider: result.riderProfile,
        trainer: null,
      },
    };
  }
);
