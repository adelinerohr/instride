import { z } from "zod";

import {
  QuestionnaireQuestionOperator,
  QuestionnaireQuestionType,
} from "../models/enums";

export const questionnaireInputSchema = z.object({
  name: z
    .string({ error: "Questionnaire name is required" })
    .trim()
    .min(1, { error: "Questionnaire name is required" }),
  questions: z.array(
    z.object({
      id: z.string(),
      text: z.string({ error: "Question text is required" }).trim().min(1),
      type: z.enum(QuestionnaireQuestionType),
      required: z.boolean(),
      order: z.number(),
      showIf: z
        .object({
          questionId: z.string(),
          responseValue: z.union([z.string(), z.boolean()]),
        })
        .nullable(),
      options: z.array(z.string()).nullable(),
    })
  ),
  boardAssignmentRules: z.array(
    z.object({
      id: z.string(),
      name: z.string({ error: "Rule name is required" }).trim().min(1),
      priority: z.number(),
      boardId: z.string(),
      conditions: z.array(
        z.object({
          questionId: z.string(),
          operator: z.enum(QuestionnaireQuestionOperator),
          responseValue: z.union([z.string(), z.boolean()]),
        })
      ),
    })
  ),
  defaultBoardId: z.string().nullable(),
});

export type QuestionnaireInputSchema = z.infer<typeof questionnaireInputSchema>;
