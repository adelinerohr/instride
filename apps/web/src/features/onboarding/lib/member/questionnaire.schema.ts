import type { types } from "@instride/api";
import { QuestionnaireQuestionType } from "@instride/shared";
import { z } from "zod";

export const questionnaireResponseSchema = z.object({
  questionnaireId: z.uuid(),
  responses: z.array(
    z.object({
      questionId: z.string(),
      responseValue: z.union([z.string(), z.boolean()]),
    })
  ),
});

// ============================================================================
// Dynamic Questionnaire Schema Builder
// ============================================================================

/**
 * Build validation schema for questionnaire responses
 * Only validates visible, required questions
 */
export function buildQuestionnaireResponsesSchema(
  questions: types.QuestionnaireQuestion[]
) {
  return z
    .array(
      z.object({
        questionId: z.string(),
        responseValue: z.union([z.string(), z.boolean()]),
      })
    )
    .superRefine((responses, ctx) => {
      questions.forEach((question) => {
        // Skip hidden questions
        if (!isQuestionVisible({ question, questions, responses })) {
          return;
        }

        // Skip optional questions
        if (!question.required) {
          return;
        }

        const value = responses.find(
          (r) => r.questionId === question.id
        )?.responseValue;

        // Boolean values are always valid (checkboxes can't be "empty")
        if (typeof value === "boolean") {
          return;
        }

        if (value === undefined || value === "") {
          ctx.addIssue({
            code: "custom",
            message: "Please answer this question",
            path: [question.id],
          });
        }
      });
    });
}

/**
 * Build initial responses with proper defaults
 */
export function buildInitialResponses(
  questions: types.QuestionnaireQuestion[]
): types.QuestionnaireQuestionResponse[] {
  const responses: types.QuestionnaireQuestionResponse[] = [];

  for (const question of questions) {
    // Only initialize top-level questions (no showIf conditions)
    // Conditional questions get initialized when their parent question is answered
    if (!question.showIf) {
      if (question.type === QuestionnaireQuestionType.MULTIPLE_CHOICE) {
        responses.push({
          questionId: question.id,
          responseValue: "",
        });
      } else if (question.type === QuestionnaireQuestionType.BOOLEAN) {
        // Don't initialize boolean questions - let user make explicit choice
        // Or initialize to false if you want a default:
        // responses.push({ questionId: question.id, responseValue: false });
      }
    }
  }

  return responses;
}

// ============================================================================
// Questionnaire Schema Helper Functions
// ============================================================================

/**
 * Check if a question should be visible based on its showIf condition
 */
export function isQuestionVisible(input: {
  question: types.QuestionnaireQuestion;
  questions: types.QuestionnaireQuestion[];
  responses: types.QuestionnaireQuestionResponse[];
}): boolean {
  if (!input.question.showIf) {
    return true;
  }

  const dependentResponse = input.responses.find(
    (response) => response.questionId === input.question.showIf?.questionId
  )?.responseValue;

  // If the dependent question hasn't been answered yet, don't show this question
  if (dependentResponse === undefined) {
    return false;
  }

  return dependentResponse === input.question.showIf.responseValue;
}

/**
 * Filter responses to only include visible questions
 */
export function filterVisibleResponses(
  questions: types.QuestionnaireQuestion[],
  responses: types.QuestionnaireQuestionResponse[]
): types.QuestionnaireQuestionResponse[] {
  return responses.filter((response) => {
    const question = questions.find((q) => q.id === response.questionId);
    return question && isQuestionVisible({ question, questions, responses });
  });
}
