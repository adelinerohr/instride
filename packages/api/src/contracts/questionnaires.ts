import {
  QuestionnaireQuestionOperator,
  QuestionnaireQuestionType,
} from "@instride/shared";

// ================================================================================================================
// Entities
// ================================================================================================================

export interface Questionnaire {
  id: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  version: number;
  isActive: boolean;
  createdByMemberId: string | null;
  defaultBoardId: string | null;
  questions: QuestionnaireQuestion[];
  boardAssignmentRules: QuestionnaireBoardAssignmentRule[];
}

export interface QuestionnaireResponse {
  id: string;
  createdAt: Date | string;
  organizationId: string;
  memberId: string;
  questionnaireId: string;
  questionnaireVersion: number;
  submittedByMemberId: string;
  responses: QuestionnaireQuestionResponse[];
  assignedBoardIds: string[];
  completedAt: Date | string;
}

export interface QuestionnaireQuestionResponse {
  questionId: string;
  responseValue: ResponseValue;
}

export interface QuestionnaireQuestion {
  id: string;
  text: string;
  type: QuestionnaireQuestionType;
  required: boolean;
  order: number;
  options: string[] | null;
  showIf: QuestionnaireQuestionResponse | null;
}

export interface QuestionnaireBoardAssignmentRule {
  id: string;
  name: string;
  conditions: {
    questionId: string;
    operator: QuestionnaireQuestionOperator;
    responseValue: ResponseValue;
  }[];
  boardId: string;
  priority: number;
}

export type ResponseValue = string | boolean;

// ================================================================================================================
// Requests + Responses
// ================================================================================================================

export interface SubmitQuestionnaireResponseRequest {
  questionnaireId: string;
  memberId?: string;
  responses: {
    questionId: string;
    responseValue: string | boolean;
  }[];
}

export interface SubmitQuestionnaireResponseResponse {
  responseId: string;
  assignedBoardIds: string[];
}

export interface CreateQuestionnaireRequest {
  name: string;
  isActive?: boolean;
  version?: number;
  defaultBoardId?: string | null;
  questions: QuestionnaireQuestion[];
  boardAssignmentRules: QuestionnaireBoardAssignmentRule[];
}

export interface UpdateQuestionnaireRequest extends Partial<CreateQuestionnaireRequest> {
  id: string;
}

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
