import type { types } from "@instride/api";
import { QuestionnaireQuestionType } from "@instride/shared";

export function getErrorMessages(errors: unknown[]): { message: string }[] {
  return errors.flatMap((error) => {
    if (!error) return [];
    if (typeof error === "string") return [{ message: error }];
    if (typeof error === "object" && error && "message" in error) {
      const message = (error as { message: string }).message;
      return typeof message === "string" ? [{ message }] : [];
    }
    return [{ message: String(error) }];
  });
}

export function createEmptyQuestion(
  order: number
): types.QuestionnaireQuestion {
  return {
    id: crypto.randomUUID(),
    type: QuestionnaireQuestionType.BOOLEAN,
    text: "",
    required: true,
    order,
    options: null,
    showIf: null,
  };
}

export function createEmptyRule(
  index: number,
  boards: types.Board[]
): types.QuestionnaireBoardAssignmentRule {
  return {
    id: crypto.randomUUID(),
    name: `Rule ${index + 1}`,
    conditions: [],
    boardId: boards[0]?.id,
    priority: index,
  };
}

export function normalizeQuestions(
  questions: types.QuestionnaireQuestion[]
): types.QuestionnaireQuestion[] {
  return questions.map((question, index) => ({
    ...question,
    order: index,
  }));
}

export function removeDeletedQuestionReferences(
  questions: types.QuestionnaireQuestion[],
  deletedQuestionId: string
): types.QuestionnaireQuestion[] {
  return questions.map((question, index) => ({
    ...question,
    order: index,
    showIf:
      question.showIf?.questionId === deletedQuestionId
        ? null
        : question.showIf,
  }));
}

export function removeDeletedQuestionFromRules(
  rules: types.QuestionnaireBoardAssignmentRule[],
  deletedQuestionId: string
): types.QuestionnaireBoardAssignmentRule[] {
  return rules.map((rule) => ({
    ...rule,
    conditions: rule.conditions.filter(
      (condition) => condition.questionId !== deletedQuestionId
    ),
  }));
}
