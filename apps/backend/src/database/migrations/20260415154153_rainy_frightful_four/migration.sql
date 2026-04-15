CREATE TYPE "event_scope" AS ENUM('organization', 'board', 'trainer');--> statement-breakpoint
CREATE TABLE "event_scheduling_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"event_id" uuid NOT NULL,
	"scope" "event_scope" NOT NULL,
	"block_scheduling" boolean DEFAULT false NOT NULL,
	"board_id" uuid,
	"trainer_id" uuid
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"created_by_member_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "eventSchedulingBlocks_eventId_idx" ON "event_scheduling_blocks" ("event_id");--> statement-breakpoint
CREATE INDEX "eventSchedulingBlocks_boardId_idx" ON "event_scheduling_blocks" ("board_id");--> statement-breakpoint
CREATE INDEX "eventSchedulingBlocks_trainerId_idx" ON "event_scheduling_blocks" ("trainer_id");--> statement-breakpoint
CREATE INDEX "events_organizationId_idx" ON "events" ("organization_id");--> statement-breakpoint
ALTER TABLE "event_scheduling_blocks" ADD CONSTRAINT "event_scheduling_blocks_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_scheduling_blocks" ADD CONSTRAINT "event_scheduling_blocks_board_id_boards_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_scheduling_blocks" ADD CONSTRAINT "event_scheduling_blocks_trainer_id_trainers_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_member_id_members_id_fkey" FOREIGN KEY ("created_by_member_id") REFERENCES "members"("id") ON DELETE SET NULL;