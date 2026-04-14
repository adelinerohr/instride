CREATE TYPE "guardian_relationship_statuses" AS ENUM('active', 'revoked', 'pending');--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "is_placeholder" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD COLUMN "submitted_by_member_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "guardian_relationships" ADD COLUMN "status" "guardian_relationship_statuses" DEFAULT 'pending'::"guardian_relationship_statuses" NOT NULL;--> statement-breakpoint
ALTER TABLE "guardian_relationships" ADD COLUMN "revoked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_submitted_by_member_id_members_id_fkey" FOREIGN KEY ("submitted_by_member_id") REFERENCES "members"("id") ON DELETE CASCADE;