import * as p from "drizzle-orm/pg-core";

import { organizations, members, boards } from "@/database/schema";

import {
  QuestionnaireBoardAssignmentRule,
  QuestionnaireQuestion,
} from "../types/models";

/**
 * QUESTIONNAIRES
 * Onboarding questionnaires with conditional board assignment
 */
export const questionnaires = p.pgTable(
  "questionnaires",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    organizationId: p
      .uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: p.text("name").notNull(),
    isActive: p.boolean("is_active").notNull().default(true),
    version: p.integer("version").notNull().default(1),
    defaultBoardId: p
      .uuid("default_board_id")
      .references(() => boards.id, { onDelete: "set null" }),

    questions: p
      .jsonb("questions")
      .$type<QuestionnaireQuestion[]>()
      .notNull()
      .default([]),

    boardAssignmentRules: p
      .jsonb("board_assignment_rules")
      .$type<QuestionnaireBoardAssignmentRule[]>()
      .notNull()
      .default([]),

    createdByMemberId: p
      .uuid("created_by_member_id")
      .references(() => members.id, { onDelete: "set null" }),

    createdAt: p.timestamp("created_at").notNull().defaultNow(),
    updatedAt: p
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    p.index("questionnaires_organization_idx").on(table.organizationId),
    p
      .index("questionnaires_organization_active_idx")
      .on(table.organizationId, table.isActive),
  ]
);

export type Questionnaire = typeof questionnaires.$inferSelect;
export type NewQuestionnaire = typeof questionnaires.$inferInsert;
