CREATE TYPE "conversation_type" AS ENUM('direct', 'group');--> statement-breakpoint
CREATE TYPE "message_attachment_type" AS ENUM('lesson_reference', 'lesson_proposal');--> statement-breakpoint
CREATE TYPE "message_response_status" AS ENUM('pending', 'processing', 'accepted', 'declined', 'cancelled', 'failed');--> statement-breakpoint
CREATE TYPE "conversation_participant_role" AS ENUM('staff', 'rider', 'guardian');--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"type" "conversation_type" DEFAULT 'direct'::"conversation_type" NOT NULL,
	"title" text,
	"created_by" uuid NOT NULL,
	"last_message_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_responses" (
	"message_id" uuid PRIMARY KEY,
	"for_rider_id" uuid NOT NULL,
	"status" "message_response_status" DEFAULT 'pending'::"message_response_status" NOT NULL,
	"responded_by" uuid,
	"responded_at" timestamp with time zone,
	"result_enrollment_id" uuid,
	"result_lesson_instance_id" uuid,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"body" text,
	"attachment_type" "message_attachment_type",
	"attachment_id" uuid,
	"attachment_metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"edited_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "messages_attachment_shape" CHECK ((
      ("attachment_type" IS NULL AND "attachment_id" IS NULL AND "attachment_metadata" IS NULL)
      OR ("attachment_type" = 'lesson_reference' AND "attachment_id" IS NOT NULL AND "attachment_metadata" IS NULL)
      OR ("attachment_type" = 'lesson_proposal' AND "attachment_id" IS NULL AND "attachment_metadata" IS NOT NULL)
    ))
);
--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"conversation_id" uuid,
	"member_id" uuid,
	"role" "conversation_participant_role" NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_read_message_id" uuid,
	"muted_at" timestamp with time zone,
	"left_at" timestamp with time zone,
	CONSTRAINT "conversation_participants_pkey" PRIMARY KEY("conversation_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "conversation_subject_riders" (
	"conversation_id" uuid,
	"rider_id" uuid,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_subject_riders_pkey" PRIMARY KEY("conversation_id","rider_id")
);
--> statement-breakpoint
CREATE INDEX "conversations_org_recency_idx" ON "conversations" ("organization_id","last_message_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "conversations_created_by_idx" ON "conversations" ("created_by");--> statement-breakpoint
CREATE INDEX "message_responses_rider_status_idx" ON "message_responses" ("for_rider_id","status");--> statement-breakpoint
CREATE INDEX "messages_conversation_time_idx" ON "messages" ("conversation_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "messages" ("sender_id");--> statement-breakpoint
CREATE INDEX "conversation_participants_member_idx" ON "conversation_participants" ("member_id");--> statement-breakpoint
CREATE INDEX "conversation_subject_riders_rider_idx" ON "conversation_subject_riders" ("rider_id");--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_members_id_fkey" FOREIGN KEY ("created_by") REFERENCES "members"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "message_responses" ADD CONSTRAINT "message_responses_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message_responses" ADD CONSTRAINT "message_responses_for_rider_id_riders_id_fkey" FOREIGN KEY ("for_rider_id") REFERENCES "riders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message_responses" ADD CONSTRAINT "message_responses_responded_by_members_id_fkey" FOREIGN KEY ("responded_by") REFERENCES "members"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "message_responses" ADD CONSTRAINT "message_responses_vLYlC4RaxKOO_fkey" FOREIGN KEY ("result_enrollment_id") REFERENCES "lesson_instance_enrollments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "message_responses" ADD CONSTRAINT "message_responses_38JMeKyiZ4HV_fkey" FOREIGN KEY ("result_lesson_instance_id") REFERENCES "lesson_instances"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_members_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "members"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_last_read_message_id_messages_id_fkey" FOREIGN KEY ("last_read_message_id") REFERENCES "messages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "conversation_subject_riders" ADD CONSTRAINT "conversation_subject_riders_PTLiyVJXRMRh_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "conversation_subject_riders" ADD CONSTRAINT "conversation_subject_riders_rider_id_riders_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE CASCADE;