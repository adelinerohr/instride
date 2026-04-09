import {
  Questionnaire,
  QuestionnaireBoardAssignmentRule,
  QuestionnaireQuestion,
} from "../interfaces/questionnaire";

export interface EditQuestionnaireRequest extends Omit<
  Questionnaire,
  "id" | "createdAt" | "updatedAt" | "createdByMemberId"
> {}

export interface CreateQuestionnaireRequest {
  name: string;
  questions: QuestionnaireQuestion[];
  boardAssignmentRules: QuestionnaireBoardAssignmentRule[];
  defaultBoardId?: string;
}

export interface UpdateQuestionnaireRequest extends EditQuestionnaireRequest {}

export interface UpdateQuestionnaireResponse {
  questionnaire: Questionnaire;
}

export interface CreateQuestionnaireResponse {
  questionnaire: Questionnaire;
}

export interface ListActiveQuestionnairesResponse {
  questionnaire?: Questionnaire;
}

export interface ListQuestionnairesRequest {
  organizationId: string;
}

export interface ListQuestionnairesResponse {
  questionnaires: Questionnaire[];
}

export interface GetQuestionnaireResponse {
  questionnaire: Questionnaire;
}

export interface SubmitQuestionnaireResponseRequest {
  organizationId: string;
  userId?: string;
  responses: {
    questionId: string;
    value: string | boolean;
  }[];
}

export interface SubmitQuestionnaireResponseResponse {
  responseId: string;
  assignedBoardIds: string[];
}
