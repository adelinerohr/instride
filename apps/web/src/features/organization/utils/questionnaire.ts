import type {
  Board,
  QuestionnaireBoardAssignmentRule,
  QuestionnaireQuestion,
} from "@instride/api";
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

export function createEmptyQuestion(order: number): QuestionnaireQuestion {
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
  boards: Board[]
): QuestionnaireBoardAssignmentRule {
  return {
    id: crypto.randomUUID(),
    name: `Rule ${index + 1}`,
    conditions: [],
    boardId: boards[0]?.id,
    priority: index,
  };
}

export function normalizeQuestions(
  questions: QuestionnaireQuestion[]
): QuestionnaireQuestion[] {
  return questions.map((question, index) => ({
    ...question,
    order: index,
  }));
}

export function removeDeletedQuestionReferences(
  questions: QuestionnaireQuestion[],
  deletedQuestionId: string
): QuestionnaireQuestion[] {
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
  rules: QuestionnaireBoardAssignmentRule[],
  deletedQuestionId: string
): QuestionnaireBoardAssignmentRule[] {
  return rules.map((rule) => ({
    ...rule,
    conditions: rule.conditions.filter(
      (condition) => condition.questionId !== deletedQuestionId
    ),
  }));
}
