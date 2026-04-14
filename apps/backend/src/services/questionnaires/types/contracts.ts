import { Questionnaire, QuestionnaireResponse } from "./models";

export interface ListQuestionnairesResponse {
  questionnaires: Questionnaire[];
}

export interface GetQuestionnaireResponse {
  questionnaire: Questionnaire;
}

export interface ListQuestionnaireResponsesResponse {
  responses: QuestionnaireResponse[];
}

export interface GetQuestionnaireResponseResponse {
  response: QuestionnaireResponse;
}
