import { QuestionnaireQuestionResponse } from "@instride/api/contracts";
import * as p from "drizzle-orm/pg-core";

import { questionnaires, organizations, members } from "@/database/schema";

/**
 * QUESTIONNAIRE RESPONSES
 * A response to a questionnaire
 */
export const questionnaireResponses = p.pgTable(
  "questionnaire_responses",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    questionnaireId: p
      .uuid("questionnaire_id")
      .notNull()
      .references(() => questionnaires.id, { onDelete: "cascade" }),
    questionnaireVersion: p.integer("questionnaire_version").notNull(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    memberId: p
      .uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    submittedByMemberId: p
      .uuid("submitted_by_member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),

    // responses as JSONB: [{ questionId, answer }]
    responses: p
      .jsonb("responses")
      .$type<QuestionnaireQuestionResponse[]>()
      .notNull()
      .default([]),

    // board IDs assigned based on rules
    assignedBoardIds: p
      .uuid("assigned_board_ids")
      .array()
      .notNull()
      .default([]),

    completedAt: p.timestamp("completed_at", { withTimezone: true }).notNull(),

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    p.index("qr_organization_idx").on(table.organizationId),
    p.index("qr_member_idx").on(table.memberId),
    p.index("qr_questionnaire_idx").on(table.questionnaireId),
    p
      .index("qr_organization_member_idx")
      .on(table.organizationId, table.memberId),
    p
      .uniqueIndex("qr_member_questionnaire_unique_idx")
      .on(table.memberId, table.questionnaireId),
  ]
);

export type QuestionnaireResponseRow =
  typeof questionnaireResponses.$inferSelect;
export type NewQuestionnaireResponseRow =
  typeof questionnaireResponses.$inferInsert;
