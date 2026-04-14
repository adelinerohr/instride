import {
  QuestionnaireQuestionOperator,
  QuestionnaireQuestionType,
} from "@instride/shared";

export type ResponseValue = string | boolean;

export interface Questionnaire {
  organizationId: string;
  id: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  isActive: boolean;
  version: number;
  defaultBoardId: string | null;
  questions: QuestionnaireQuestion[];
  boardAssignmentRules: QuestionnaireBoardAssignmentRule[];
  createdByMemberId: string | null;
}

export interface QuestionnaireResponse {
  id: string;
  createdAt: Date | string;
  organizationId: string;
  questionnaireId: string;
  questionnaireVersion: number;
  memberId: string;
  submittedByMemberId: string;
  responses: QuestionnaireQuestionResponse[];
  assignedBoardIds: string[];
  completedAt: Date | string;
}

export interface QuestionnaireQuestionResponse {
  questionId: string;
  responseValue: string | boolean;
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
