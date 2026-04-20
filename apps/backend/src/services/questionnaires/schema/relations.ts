import { defineRelationsPart } from "drizzle-orm";

import * as schema from "@/database/schema";

export const questionnairesRelations = defineRelationsPart(schema, (r) => ({
  questionnaires: {
    organization: r.one.organizations({
      from: r.questionnaires.organizationId,
      to: r.organizations.id,
    }),
    defaultBoard: r.one.boards({
      from: r.questionnaires.defaultBoardId,
      to: r.boards.id,
    }),
    createdBy: r.one.members({
      from: r.questionnaires.createdByMemberId,
      to: r.members.id,
    }),
    responses: r.many.questionnaireResponses({
      from: r.questionnaires.id,
      to: r.questionnaireResponses.questionnaireId,
    }),
  },

  questionnaireResponses: {
    questionnaire: r.one.questionnaires({
      from: r.questionnaireResponses.questionnaireId,
      to: r.questionnaires.id,
    }),
    organization: r.one.organizations({
      from: r.questionnaireResponses.organizationId,
      to: r.organizations.id,
    }),
    member: r.one.members({
      from: r.questionnaireResponses.memberId,
      to: r.members.id,
    }),
    submittedBy: r.many.members({
      from: r.questionnaireResponses.submittedByMemberId,
      to: r.members.id,
    }),
  },
}));
