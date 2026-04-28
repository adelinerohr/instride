import { LessonProposalPayload } from "@instride/api/contracts";
import { MessageAttachmentType, MessageResponseStatus } from "@instride/shared";
import { sql } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";

import {
  lessonInstanceEnrollments,
  lessonInstances,
  members,
  riders,
} from "@/database/schema";

import { conversations } from "./conversations";

export const messageAttachmentTypeEnum = p.pgEnum(
  "message_attachment_type",
  MessageAttachmentType
);
export const messageResponseStatusEnum = p.pgEnum(
  "message_response_status",
  MessageResponseStatus
);

// ============================================================================
// Messages
// ============================================================================
//
// Polymorphic attachments via discriminator:
//
//   attachmentType = 'lesson_reference'
//     attachmentId = lessonInstances.id (logical FK; CHECKed in migration)
//     attachmentMetadata = null
//
//   attachmentType = 'lesson_proposal'
//     attachmentId = null
//     attachmentMetadata = LessonProposalPayload (Zod-validated on write)
//
//   attachmentType = null
//     attachmentId = null, attachmentMetadata = null  (plain text message)
//
// CHECK constraints in the migration enforce these combinations.
export const messages = p.pgTable(
  "messages",
  {
    id: p.uuid("id").primaryKey().defaultRandom(),
    conversationId: p
      .uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: p
      .uuid("sender_id")
      .notNull()
      .references(() => members.id, { onDelete: "restrict" }),

    // Nullable: attachment-only messages may have no body
    body: p.text("body"),

    attachmentType: messageAttachmentTypeEnum("attachment_type"),
    // Logical FK — points at lessonInstances.id when type=lesson_reference.
    // Not declared as a hard FK because the target table varies by type
    // (today only one type uses it; future types may reference different tables).
    attachmentId: p.uuid("attachment_id"),
    // Typed JSONB. The cast gives us a typed read model on the client side.
    attachmentMetadata: p
      .jsonb("attachment_metadata")
      .$type<LessonProposalPayload>(),

    createdAt: p
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    editedAt: p.timestamp("edited_at", { withTimezone: true }),
    deletedAt: p.timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    p
      .index("messages_conversation_time_idx")
      .on(table.conversationId, table.createdAt.desc()),
    p.index("messages_sender_idx").on(table.senderId),
    p.check(
      "messages_attachment_shape",
      sql`(
      (${table.attachmentType} IS NULL AND ${table.attachmentId} IS NULL AND ${table.attachmentMetadata} IS NULL)
      OR (${table.attachmentType} = 'lesson_reference' AND ${table.attachmentId} IS NOT NULL AND ${table.attachmentMetadata} IS NULL)
      OR (${table.attachmentType} = 'lesson_proposal' AND ${table.attachmentId} IS NULL AND ${table.attachmentMetadata} IS NOT NULL)
    )`
    ),
  ]
);

// ============================================================================
// Message responses — generic response state for actionable attachments
// ============================================================================
//
// 1:1 with messages, only for messages whose attachmentType expects a
// response (lesson_reference, lesson_proposal). Lives in its own table so:
//   - response status can be indexed (hot path: "show me pending things")
//   - the accept saga has a real row to lock during the processing transition
//   - response result FKs are explicit, not buried in JSONB
//   - future response-bearing attachment types reuse this table

export const messageResponses = p.pgTable(
  "message_responses",
  {
    // PK = messageId enforces 1:1
    messageId: p
      .uuid("message_id")
      .primaryKey()
      .references(() => messages.id, { onDelete: "cascade" }),

    // Who is expected to respond. For direct chats this is the subject rider.
    // In group chats (v2), this is the specific rider the message targets.
    // For guardian-managed dependents, the guardian responds *for* this rider.
    forRiderId: p
      .uuid("for_rider_id")
      .notNull()
      .references(() => riders.id, { onDelete: "cascade" }),

    status: messageResponseStatusEnum("status").notNull().default("pending"),

    respondedBy: p
      .uuid("responded_by")
      .references(() => members.id, { onDelete: "set null" }),
    respondedAt: p.timestamp("responded_at", { withTimezone: true }),

    // Result of acceptance — one of these is set on status='accepted',
    // depending on the underlying attachmentType.
    //   lesson_reference accept → resultEnrollmentId
    //   lesson_proposal accept  → resultLessonInstanceId
    // CHECK constraints enforce exactly-one-set-on-accept in the migration.
    resultEnrollmentId: p
      .uuid("result_enrollment_id")
      .references(() => lessonInstanceEnrollments.id, { onDelete: "set null" }),
    resultLessonInstanceId: p
      .uuid("result_lesson_instance_id")
      .references(() => lessonInstances.id, { onDelete: "set null" }),

    // Set on status='failed' — domain reason from the target service
    // (e.g. "lesson_full", "rider_ineligible", "schedule_conflict",
    // "proposal_invalid", "trainer_unavailable")
    failureReason: p.text("failure_reason"),

    createdAt: p
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: p
      .timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    // Hot path: rendering pending items in a rider's inbox
    p.index("message_responses_rider_status_idx").on(t.forRiderId, t.status),
  ]
);

export type MessageRow = typeof messages.$inferSelect;
export type NewMessageRow = typeof messages.$inferInsert;

export type MessageResponseRow = typeof messageResponses.$inferSelect;
export type NewMessageResponseRow = typeof messageResponses.$inferInsert;
