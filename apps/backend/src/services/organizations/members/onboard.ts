import type {
  GetMemberResponse,
  Questionnaire,
  QuestionnaireQuestionResponse,
  Waiver,
} from "@instride/api/contracts";
import { MembershipRole } from "@instride/shared";
import { generateId } from "better-auth";
import { api, APIError } from "encore.dev/api";

import { authService, createAuthService } from "@/services/auth/auth.service";
import { createBoardService } from "@/services/boards/board.service";
import {
  createQuestionnaireService,
  questionnaireService,
} from "@/services/questionnaires/questionnaire.service";
import {
  evaluateBoardAssignmentRules,
  validateResponses,
} from "@/services/questionnaires/submit";
import { createWaiverService, waiverService } from "@/services/waivers/service";
import { requireAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { db } from "../db";
import { invitationService } from "../invitations/invitation.service";
import { toMember } from "../mappers";
import { organizationService } from "../organization.service";
import { RiderRow, TrainerRow } from "../schema";
import { createMemberService } from "./member.service";

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

    const user = await authService.findOneUser(userID);
    const organization = await organizationService.findOne(
      params.organizationId
    );

    const acceptedInvitation = await invitationService.findAcceptedForOrgEmail({
      organizationId: organization.authOrganizationId,
      email: user.email,
    });
    const invitedRoles = acceptedInvitation?.roles ?? [];

    const effectiveRoles = [
      ...new Set<MembershipRole>([...invitedRoles, ...params.user.roles]),
    ];

    if (!organization.allowPublicJoin && !acceptedInvitation) {
      throw APIError.permissionDenied(
        "This organization does not allow public join"
      );
    }

    let questionnaire: Questionnaire | undefined;
    if (params.questionnaire) {
      questionnaire = await questionnaireService.findOne(
        params.questionnaire.questionnaireId,
        organization.id
      );
      validateResponses(params.questionnaire.responses, questionnaire);
    }

    let waiver: Waiver | undefined;
    if (params.waiver) {
      waiver = await waiverService.findOne(
        params.waiver.waiverId,
        organization.id
      );
    }

    const result = await db.transaction(async (tx) => {
      const txMemberService = createMemberService(tx);
      const txAuthService = createAuthService(tx);

      // 1. Update user profile
      const authUser = await txAuthService.updateUser(userID, {
        name: params.user.name,
        phone: params.user.phone,
        dateOfBirth: params.user.dateOfBirth,
        image: params.user.image,
      });

      // 2. Create Better Auth member
      const authMember = await txAuthService.createMember({
        id: generateId(),
        userId: userID,
        organizationId: organization.authOrganizationId,
        role: effectiveRoles.join(","),
      });

      // 3. Create member profile
      const member = await txMemberService.create({
        userId: userID,
        organizationId: organization.id,
        authMemberId: authMember.id,
        roles: effectiveRoles,
        onboardingComplete: true,
      });

      let riderProfile: RiderRow | null = null;
      let trainerProfile: TrainerRow | null = null;

      if (effectiveRoles.includes(MembershipRole.RIDER)) {
        const rider = await txMemberService.createRider({
          memberId: member.id,
          organizationId: organization.id,
          isRestricted: false,
        });
        riderProfile = rider;

        if (questionnaire && params.questionnaire) {
          const assignedBoardIds = evaluateBoardAssignmentRules(
            questionnaire,
            params.questionnaire.responses
          );

          await createQuestionnaireService(tx).createResponse({
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
            await createBoardService(tx).bulkCreateAssignments(
              assignedBoardIds.map((boardId) => ({
                organizationId: organization.id,
                boardId,
                riderId: rider.id,
              }))
            );
          }
        }
      }

      if (effectiveRoles.includes(MembershipRole.TRAINER)) {
        const trainer = await txMemberService.createTrainer({
          memberId: member.id,
          organizationId: organization.id,
        });
        trainerProfile = trainer;
      }

      if (waiver && params.waiver) {
        await createWaiverService(tx).createSignature({
          organizationId: organization.id,
          waiverId: waiver.id,
          signerMemberId: member.id,
          onBehalfOfMemberId: member.id,
          waiverVersion: waiver.version,
        });
      }

      return { member, authUser, riderProfile, trainerProfile };
    });

    assertExists(result.authUser, "Member has no auth user");

    return {
      member: toMember({
        ...result.member,
        authUser: result.authUser,
        rider: result.riderProfile,
        trainer: result.trainerProfile,
      }),
    };
  }
);
