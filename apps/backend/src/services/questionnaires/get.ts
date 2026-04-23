import { api, APIError } from "encore.dev/api";

import { db } from "./db";
import {
  GetQuestionnaireResponse,
  ListQuestionnaireResponsesResponse,
  ListQuestionnairesResponse,
} from "./types/contracts";

export const listQuestionnaires = api(
  {
    expose: true,
    method: "GET",
    path: "/organizations/:organizationId/questionnaires",
    auth: true,
  },
  async ({
    organizationId,
  }: {
    organizationId: string;
  }): Promise<ListQuestionnairesResponse> => {
    const questionnaires = await db.query.questionnaires.findMany({
      where: { organizationId },
    });
    return { questionnaires };
  }
);

export const getQuestionnaire = api(
  {
    expose: true,
    method: "GET",
    path: "/questionnaires/:id",
    auth: true,
  },
  async ({ id }: { id: string }): Promise<GetQuestionnaireResponse> => {
    const questionnaire = await db.query.questionnaires.findFirst({
      where: { id },
    });
    if (!questionnaire) {
      throw APIError.notFound("Questionnaire not found");
    }
    return { questionnaire };
  }
);

export const getQuestionnaireResponse = api(
  {
    expose: true,
    method: "GET",
    path: "/questionnaires/:questionnaireId/responses",
    auth: true,
  },
  async ({
    questionnaireId,
  }: {
    questionnaireId: string;
  }): Promise<ListQuestionnaireResponsesResponse> => {
    const responses = await db.query.questionnaireResponses.findMany({
      where: { questionnaireId },
    });
    return { responses };
  }
);
