import type { types } from "@instride/api";
import { QuestionnaireQuestionType } from "@instride/shared";
import { z } from "zod";

export const questionnaireSchema = z.object({
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
        if (!isQuestionVisible(question, responses)) {
          return;
        }

        // Skip optional questions
        if (!question.required) {
          return;
        }

        const value = responses.find(
          (r) => r.questionId === question.id
        )?.responseValue;

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
export function isQuestionVisible(
  question: types.QuestionnaireQuestion,
  responses: types.QuestionnaireQuestionResponse[]
): boolean {
  if (!question.showIf) {
    return true;
  }

  const dependentResponse = responses.find(
    (response) => response.questionId === question.showIf?.questionId
  )?.responseValue;

  // If the dependent question hasn't been answered yet, don't show this question
  if (dependentResponse === undefined) {
    return false;
  }

  return dependentResponse === question.showIf.responseValue;
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
    return question && isQuestionVisible(question, [response]);
  });
}
