import {
  QuestionnaireQuestionOperator,
  QuestionnaireQuestionType,
} from "../models/enums";

export type ResponseValue = string | boolean;

export interface QuestionnaireQuestion {
  id: string;
  text: string;
  type: QuestionnaireQuestionType;
  required: boolean;
  order: number;
  options: string[] | null;
  showIf: {
    questionId: string;
    responseValue: ResponseValue;
  } | null;
}

export interface QuestionnaireBoardAssignmentRule {
  questionId: string;
  name: string;
  conditions: {
    questionId: string;
    operator: QuestionnaireQuestionOperator;
    responseValue: ResponseValue;
  }[];
  boardId: string;
  priority: number;
}

export interface Questionnaire {
  id: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId: string;
  isActive: boolean;
  createdByMemberId: string | null;
  version: number;
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
  responses: unknown;
  assignedBoardIds: string[];
  completedAt: Date | string;
}

export interface Response {
  questionId: string;
  value: ResponseValue;
}
