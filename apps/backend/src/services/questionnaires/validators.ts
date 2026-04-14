import { QuestionnaireQuestionType } from "@instride/shared";
import { APIError } from "encore.dev/api";

import {
  QuestionnaireBoardAssignmentRule,
  QuestionnaireQuestion,
  QuestionnaireQuestionResponse,
} from "./types/models";

export function validateQuestions(questions: QuestionnaireQuestion[]) {
  // Check unique IDs
  const ids = questions.map((q) => q.id);
  if (new Set(ids).size !== ids.length) {
    throw APIError.invalidArgument("Question IDs must be unique");
  }

  // Check sequential order
  const orders = questions.map((q) => q.order).sort((a, b) => a - b);
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== i) {
      throw APIError.invalidArgument(
        "Question orders must be sequential starting from 0"
      );
    }
  }

  // Check multipleChoice has options
  for (const question of questions) {
    if (
      question.type === QuestionnaireQuestionType.MULTIPLE_CHOICE &&
      (!question.options || question.options.length === 0)
    ) {
      throw APIError.invalidArgument(
        `Question ${question.id} is multipleChoice but has no options`
      );
    }
  }

  // Check showIf references valid question
  for (const question of questions) {
    if (question.showIf) {
      const referenced = questions.find(
        (q) => q.id === question.showIf!.questionId
      );
      if (!referenced) {
        throw APIError.invalidArgument(
          `Question ${question.id} references non-existent question ${question.showIf.questionId}`
        );
      }
      if (referenced.order >= question.order) {
        throw APIError.invalidArgument(
          "showIf can only reference previous questions"
        );
      }
    }
  }
}

export function validateRules(
  rules: QuestionnaireBoardAssignmentRule[],
  questions: QuestionnaireQuestion[]
) {
  const questionIds = new Set(questions.map((q) => q.id));

  for (const rule of rules) {
    // Check all condition question IDs exist
    for (const condition of rule.conditions) {
      if (!questionIds.has(condition.questionId)) {
        throw APIError.invalidArgument(
          `Rule ${rule.name} references non-existent question ID ${condition.questionId}`
        );
      }
    }

    // Check priority is valid
    if (rule.priority < 0) {
      throw APIError.invalidArgument("Rule priority must be non-negative");
    }
  }
}

export function validateResponses(
  responses: QuestionnaireQuestionResponse[],
  questions: QuestionnaireQuestion[]
): void {
  // Check all required questions are answered
  const answeredIds = new Set(responses.map((r) => r.questionId));

  for (const question of questions) {
    if (question.required && !answeredIds.has(question.id)) {
      // Check if question should be shown (conditional logic)
      const shouldShow = shouldShowQuestion(question, responses);
      if (shouldShow) {
        throw new Error(`Required question ${question.id} not answered`);
      }
    }
  }

  // Validate response values match question types
  for (const response of responses) {
    const question = questions.find((q) => q.id === response.questionId);
    if (!question) continue;

    if (
      question.type === QuestionnaireQuestionType.BOOLEAN &&
      typeof response.value !== "boolean"
    ) {
      throw new Error(`Question ${question.id} expects boolean answer`);
    }

    if (question.type === QuestionnaireQuestionType.MULTIPLE_CHOICE) {
      if (typeof response.value !== "string") {
        throw new Error(
          `Question ${question.id} expects string answer for MultipleChoice`
        );
      }
      if (!question.options?.includes(response.value)) {
        throw new Error(`Question ${question.id} answer not in valid options`);
      }
    }
  }
}

export function shouldShowQuestion(
  question: QuestionnaireQuestion,
  responses: QuestionnaireQuestionResponse[]
): boolean {
  if (!question.showIf) return true;

  const dependentResponse = responses.find(
    (a) => a.questionId === question.showIf!.questionId
  );

  // If the dependent question hasn't been answered yet, don't show this question
  if (!dependentResponse || dependentResponse.value === undefined) {
    return false;
  }

  return dependentResponse.value === question.showIf.responseValue;
}
