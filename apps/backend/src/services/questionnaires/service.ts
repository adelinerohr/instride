import { and, eq } from "drizzle-orm";

import {
  NewQuestionnaireResponseRow,
  NewQuestionnaireRow,
  QuestionnaireResponseRow,
  questionnaireResponses,
  QuestionnaireRow,
  questionnaires,
} from "@/database/schema";
import { Database, Transaction } from "@/shared/utils/schema";
import { assertExists } from "@/shared/utils/validation";

import { db } from "./db";

export const createQuestionnaireService = (
  client: Database | Transaction = db
) => ({
  create: async (data: NewQuestionnaireRow) => {
    const [questionnaire] = await client
      .insert(questionnaires)
      .values(data)
      .returning();
    assertExists(questionnaire, "Failed to create questionnaire");
    return questionnaire;
  },

  createResponse: async (data: NewQuestionnaireResponseRow) => {
    const [response] = await client
      .insert(questionnaireResponses)
      .values(data)
      .returning();
    assertExists(response, "Failed to create questionnaire response");
    return response;
  },

  update: async (
    id: string,
    organizationId: string,
    data: Partial<QuestionnaireRow>
  ) => {
    const [questionnaire] = await client
      .update(questionnaires)
      .set(data)
      .where(
        and(
          eq(questionnaires.id, id),
          eq(questionnaires.organizationId, organizationId)
        )
      )
      .returning();
    assertExists(questionnaire, "Failed to update questionnaire");
    return questionnaire;
  },

  updateResponse: async (
    id: string,
    organizationId: string,
    data: Partial<QuestionnaireResponseRow>
  ) => {
    const [response] = await client
      .update(questionnaireResponses)
      .set(data)
      .where(
        and(
          eq(questionnaireResponses.id, id),
          eq(questionnaireResponses.organizationId, organizationId)
        )
      )
      .returning();
    assertExists(response, "Failed to update questionnaire response");
    return response;
  },

  findOne: async (id: string, organizationId: string) => {
    const questionnaire = await client.query.questionnaires.findFirst({
      where: {
        id,
        organizationId,
      },
    });
    assertExists(questionnaire, "Questionnaire not found");
    return questionnaire;
  },

  findOneResponse: async (id: string, organizationId: string) => {
    const response = await client.query.questionnaireResponses.findFirst({
      where: {
        id,
        organizationId,
      },
    });
    assertExists(response, "Questionnaire response not found");
    return response;
  },

  findMany: async (organizationId: string) => {
    const questionnaires = await client.query.questionnaires.findMany({
      where: {
        organizationId,
      },
    });
    return questionnaires;
  },

  findManyResponses: async (
    organizationId: string,
    questionnaireId?: string
  ) => {
    const responses = await client.query.questionnaireResponses.findMany({
      where: {
        organizationId,
        ...(questionnaireId ? { questionnaireId } : {}),
      },
    });
    return responses;
  },

  deactivate: async (id: string, organizationId: string) => {
    const [questionnaire] = await client
      .update(questionnaires)
      .set({ isActive: false })
      .where(
        and(
          eq(questionnaires.id, id),
          eq(questionnaires.organizationId, organizationId)
        )
      )
      .returning();
    assertExists(questionnaire, "Failed to deactivate questionnaire");
    return questionnaire;
  },
});

export const questionnaireService = createQuestionnaireService();
