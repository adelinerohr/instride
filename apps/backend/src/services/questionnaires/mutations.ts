import {
  CreateQuestionnaireRequest,
  GetQuestionnaireResponse,
  UpdateQuestionnaireRequest,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { requireOrganizationAdmin } from "../auth/gates";
import { questionnaireService } from "./questionnaire.service";
import { validateQuestions, validateRules } from "./validators";

export const createQuestionnaire = api(
  {
    method: "POST",
    path: "/questionnaires",
    expose: true,
    auth: true,
  },
  async (
    request: CreateQuestionnaireRequest
  ): Promise<GetQuestionnaireResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const caller = await requireOrganizationAdmin(organizationId);

    validateQuestions(request.questions);
    validateRules(request.boardAssignmentRules, request.questions);

    const questionnaire = await questionnaireService.create({
      ...request,
      organizationId,
      isActive: true,
      version: 1,
      createdByMemberId: caller.id,
    });

    return { questionnaire };
  }
);

export const updateQuestionnaire = api(
  {
    method: "PUT",
    path: "/questionnaires/:id",
    expose: true,
    auth: true,
  },
  async (
    request: UpdateQuestionnaireRequest
  ): Promise<GetQuestionnaireResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const { id, ...data } = request;

    const questionnaire = await questionnaireService.update(
      id,
      organizationId,
      data
    );
    return { questionnaire };
  }
);

export const deactivateQuestionnaire = api(
  {
    method: "DELETE",
    path: "/questionnaires/:id",
    expose: true,
    auth: true,
  },
  async ({ id }: { id: string }): Promise<GetQuestionnaireResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const questionnaire = await questionnaireService.deactivate(
      id,
      organizationId
    );
    return { questionnaire };
  }
);
