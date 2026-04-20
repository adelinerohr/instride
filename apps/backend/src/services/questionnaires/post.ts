import { eq } from "drizzle-orm";
import { api } from "encore.dev/api";
import { organizations } from "~encore/clients";

import { requireOrganizationAuth } from "@/shared/auth";
import { assertExists } from "@/shared/utils/validation";

import { assertAdmin } from "../auth/gates";
import { db } from "./db";
import { questionnaireResponses, questionnaires } from "./schema";
import {
  assertMaySubmitForMember,
  evaluateBoardAssignmentRules,
  syncRiderBoardAssignments,
  validateResponses,
} from "./submit";
import { GetQuestionnaireResponse } from "./types/contracts";
import {
  QuestionnaireBoardAssignmentRule,
  QuestionnaireQuestion,
} from "./types/models";
import { validateQuestions, validateRules } from "./validators";

interface CreateQuestionnaireRequest {
  name: string;
  isActive?: boolean;
  version?: number;
  defaultBoardId?: string | null;
  questions: QuestionnaireQuestion[];
  boardAssignmentRules: QuestionnaireBoardAssignmentRule[];
}

export const createQuestionnaire = api(
  {
    expose: true,
    method: "POST",
    path: "/questionnaires",
    auth: true,
  },
  async (
    request: CreateQuestionnaireRequest
  ): Promise<GetQuestionnaireResponse> => {
    const { organizationId, userID } = requireOrganizationAuth();

    const { member: caller } = await organizations.getMember();
    assertAdmin(organizationId, userID);

    // Validate questions (order, unique IDs, etc.)
    validateQuestions(request.questions);

    // Validate rules reference valid question IDs
    validateRules(request.boardAssignmentRules, request.questions);

    const [questionnaire] = await db
      .insert(questionnaires)
      .values({
        organizationId,
        name: request.name,
        questions: request.questions,
        boardAssignmentRules: request.boardAssignmentRules,
        defaultBoardId: request.defaultBoardId,
        isActive: true,
        version: 1,
        createdByMemberId: caller.id,
      })
      .returning();

    return { questionnaire };
  }
);

interface UpdateQuestionnaireRequest extends Partial<CreateQuestionnaireRequest> {
  id: string;
}

export const updateQuestionnaire = api(
  {
    expose: true,
    method: "PUT",
    path: "/questionnaires/:id",
    auth: true,
  },
  async (
    request: UpdateQuestionnaireRequest
  ): Promise<GetQuestionnaireResponse> => {
    const { id, ...data } = request;
    const [questionnaire] = await db
      .update(questionnaires)
      .set(data)
      .where(eq(questionnaires.id, id))
      .returning();
    return { questionnaire };
  }
);

export const deactivateQuestionnaire = api(
  {
    expose: true,
    method: "DELETE",
    path: "/questionnaires/:id",
    auth: true,
  },
  async ({ id }: { id: string }): Promise<void> => {
    await db
      .update(questionnaires)
      .set({ isActive: false })
      .where(eq(questionnaires.id, id));
  }
);

// -------------------------------------------------------------
// Responses
// -------------------------------------------------------------

interface SubmitQuestionnaireResponseRequest {
  questionnaireId: string;
  memberId?: string;
  responses: {
    questionId: string;
    responseValue: string | boolean;
  }[];
}

interface SubmitQuestionnaireResponseResponse {
  responseId: string;
  assignedBoardIds: string[];
}

export const submitResponse = api(
  {
    expose: true,
    method: "POST",
    path: "/questionnaires/:questionnaireId/responses",
    auth: true,
  },
  async (
    request: SubmitQuestionnaireResponseRequest
  ): Promise<SubmitQuestionnaireResponseResponse> => {
    const { organizationId } = requireOrganizationAuth();
    const rawResponses = request.responses;

    const caller = await organizations.getMember();

    await assertMaySubmitForMember({
      organizationId,
      targetMemberId: request.memberId ?? caller.member.id,
      callerMemberId: caller.member.id,
    });

    const subjectMember = await db.query.members.findFirst({
      where: {
        id: request.memberId ?? caller.member.id,
        organizationId,
      },
      with: {
        rider: true,
      },
    });

    assertExists(subjectMember, "Subject member not found");

    const questionnaire = await db.query.questionnaires.findFirst({
      where: {
        id: request.questionnaireId,
        isActive: true,
      },
    });

    assertExists(questionnaire, "Questionnaire not found");
    validateResponses(rawResponses, questionnaire);

    const assignedBoardIds = evaluateBoardAssignmentRules(
      questionnaire,
      rawResponses
    );

    const [row] = await db
      .insert(questionnaireResponses)
      .values({
        questionnaireId: request.questionnaireId,
        questionnaireVersion: questionnaire.version,
        organizationId,
        memberId: subjectMember.id,
        submittedByMemberId: caller.member.id,
        responses: rawResponses,
        assignedBoardIds,
        completedAt: new Date(),
      })
      .returning();

    await syncRiderBoardAssignments({
      riderId: subjectMember.rider?.id ?? "",
      boardIds: assignedBoardIds,
    });

    return {
      responseId: row.id,
      assignedBoardIds,
    };
  }
);
