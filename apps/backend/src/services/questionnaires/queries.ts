import {
  GetQuestionnaireResponse,
  ListQuestionnaireResponsesResponse,
  ListQuestionnairesResponse,
} from "@instride/api/contracts";
import { api } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { questionnaireService } from "./service";

export const listQuestionnaires = api(
  {
    method: "GET",
    path: "/organizations/:organizationId/questionnaires",
    expose: true,
    auth: true,
  },
  async (params: {
    organizationId: string;
  }): Promise<ListQuestionnairesResponse> => {
    const questionnaires = await questionnaireService.findMany(
      params.organizationId
    );
    return { questionnaires };
  }
);

export const getQuestionnaire = api(
  {
    method: "GET",
    path: "/questionnaires/:id",
    expose: true,
    auth: true,
  },
  async (params: { id: string }): Promise<GetQuestionnaireResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const questionnaire = await questionnaireService.findOne(
      params.id,
      organizationId
    );
    return { questionnaire };
  }
);

export const listQuestionnaireResponses = api(
  {
    method: "GET",
    path: "/questionnaires/:questionnaireId/responses",
    expose: true,
    auth: true,
  },
  async (params: {
    questionnaireId: string;
  }): Promise<ListQuestionnaireResponsesResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const responses = await questionnaireService.findManyResponses(
      organizationId,
      params.questionnaireId
    );
    return { responses };
  }
);
