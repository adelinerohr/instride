import {
  SubmitQuestionnaireResponseRequest,
  SubmitQuestionnaireResponseResponse,
} from "@instride/api/contracts";
import { api, APIError, ErrCode } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { boardService } from "../boards/board.service";
import { memberRepo } from "../organizations/members/member.repo";
import { questionnaireService } from "./questionnaire.service";
import {
  assertMaySubmitForMember,
  evaluateBoardAssignmentRules,
  validateResponses,
} from "./submit";

export const submitResponse = api(
  {
    expose: true,
    method: "POST",
    path: "/questionnaires/:questionnaireId/responses",
    auth: true,
  },
  async (
    request: SubmitQuestionnaireResponseRequest
  ): Promise<SubmitQuestionnaireResponseResponse> => {
    const { organizationId, userID } = requireOrganizationAuth();
    const rawResponses = request.responses;

    const caller = await memberRepo.findOneByUser(userID, organizationId);

    await assertMaySubmitForMember({
      organizationId,
      targetMemberId: request.memberId ?? caller.id,
      callerMemberId: caller.id,
    });

    const subjectMember = await memberRepo.findOne(
      request.memberId ?? caller.id,
      organizationId
    );

    const questionnaire = await questionnaireService.findOne(
      request.questionnaireId,
      organizationId
    );

    validateResponses(rawResponses, questionnaire);

    const assignedBoardIds = evaluateBoardAssignmentRules(
      questionnaire,
      rawResponses
    );

    const response = await questionnaireService.createResponse({
      questionnaireId: request.questionnaireId,
      organizationId,
      memberId: subjectMember.id,
      submittedByMemberId: caller.id,
      responses: rawResponses,
      assignedBoardIds,
      questionnaireVersion: questionnaire.version,
      completedAt: new Date(),
    });

    for (const boardId of assignedBoardIds) {
      if (!subjectMember.rider) {
        continue;
      }
      try {
        await boardService.createAssignment({
          organizationId,
          boardId,
          riderId: subjectMember.rider.id,
        });
      } catch (error) {
        if (error instanceof APIError && error.code === ErrCode.AlreadyExists) {
          continue;
        }
        throw error;
      }
    }

    return {
      responseId: response.id,
      assignedBoardIds,
    };
  }
);
