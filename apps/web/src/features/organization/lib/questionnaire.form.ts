import type { types } from "@instride/api";
import {
  questionnaireInputSchema,
  type QuestionnaireInputSchema,
} from "@instride/shared";
import { formOptions } from "@tanstack/react-form";

const questionnaireDefaultValues: QuestionnaireInputSchema = {
  name: "",
  questions: [],
  boardAssignmentRules: [],
  defaultBoardId: null,
};

export const questionnaireFormOpts = formOptions({
  defaultValues: questionnaireDefaultValues,
  validators: { onSubmit: questionnaireInputSchema },
});

export function buildQuestionnaireDefaultValues(
  questionnaire?: types.Questionnaire
): QuestionnaireInputSchema {
  if (!questionnaire) return questionnaireDefaultValues;

  return {
    name: questionnaire.name,
    questions: questionnaire.questions,
    boardAssignmentRules: questionnaire.boardAssignmentRules,
    defaultBoardId: questionnaire.defaultBoardId,
  };
}
