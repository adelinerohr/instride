ALTER TABLE "service_trainer_assignments" DROP CONSTRAINT "service_trainer_assignments_member_id_members_id_fkey";--> statement-breakpoint
ALTER TABLE "trainer_availability" DROP CONSTRAINT "trainer_availability_member_id_members_id_fkey";--> statement-breakpoint
ALTER TABLE "time_blocks" DROP CONSTRAINT "time_blocks_trainer_member_id_members_id_fkey";--> statement-breakpoint
DROP INDEX "sta_memberId_idx";--> statement-breakpoint
DROP INDEX "trainer_avail_organization_member_idx";--> statement-breakpoint
DROP INDEX "trainer_avail_member_idx";--> statement-breakpoint
DROP INDEX "trainer_avail_member_board_idx";--> statement-breakpoint
DROP INDEX "trainer_avail_member_day_idx";--> statement-breakpoint
DROP INDEX "trainer_avail_member_day_board_idx";--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD COLUMN "context_organization_id" text;--> statement-breakpoint
ALTER TABLE "service_trainer_assignments" ADD COLUMN "trainer_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_availability" ADD COLUMN "is_open" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_availability" ADD COLUMN "openTime" time with time zone;--> statement-breakpoint
ALTER TABLE "organization_availability" ADD COLUMN "closeTime" time with time zone;--> statement-breakpoint
ALTER TABLE "trainer_availability" ADD COLUMN "trainer_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "trainer_availability" ADD COLUMN "inherits_from_org" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "trainer_availability" ADD COLUMN "is_open" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "trainer_availability" ADD COLUMN "openTime" time with time zone;--> statement-breakpoint
ALTER TABLE "trainer_availability" ADD COLUMN "closeTime" time with time zone;--> statement-breakpoint
ALTER TABLE "time_blocks" ADD COLUMN "trainer_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "service_trainer_assignments" DROP COLUMN "member_id";--> statement-breakpoint
ALTER TABLE "organization_availability" DROP COLUMN "start_time";--> statement-breakpoint
ALTER TABLE "organization_availability" DROP COLUMN "end_time";--> statement-breakpoint
ALTER TABLE "trainer_availability" DROP COLUMN "member_id";--> statement-breakpoint
ALTER TABLE "trainer_availability" DROP COLUMN "start_time";--> statement-breakpoint
ALTER TABLE "trainer_availability" DROP COLUMN "end_time";--> statement-breakpoint
ALTER TABLE "time_blocks" DROP COLUMN "trainer_member_id";--> statement-breakpoint
DROP INDEX IF EXISTS "sta_unique_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "sta_unique_idx" ON "service_trainer_assignments" ("service_id","trainer_id");--> statement-breakpoint
DROP INDEX IF EXISTS "time_blocks_trainer_idx";--> statement-breakpoint
CREATE INDEX "time_blocks_trainer_idx" ON "time_blocks" ("trainer_id");--> statement-breakpoint
DROP INDEX IF EXISTS "time_blocks_trainer_board_idx";--> statement-breakpoint
CREATE INDEX "time_blocks_trainer_board_idx" ON "time_blocks" ("trainer_id","board_id");--> statement-breakpoint
ALTER TABLE "organization_availability" ADD CONSTRAINT "org_avail_organization_board_day_unique" UNIQUE("organization_id","board_id","day_of_week");--> statement-breakpoint
CREATE INDEX "sta_trainerId_idx" ON "service_trainer_assignments" ("trainer_id");--> statement-breakpoint
CREATE INDEX "trainer_avail_organization_trainer_idx" ON "trainer_availability" ("organization_id","trainer_id");--> statement-breakpoint
CREATE INDEX "trainer_avail_trainer_idx" ON "trainer_availability" ("trainer_id");--> statement-breakpoint
CREATE INDEX "trainer_avail_trainer_board_idx" ON "trainer_availability" ("trainer_id","board_id");--> statement-breakpoint
CREATE INDEX "trainer_avail_trainer_day_idx" ON "trainer_availability" ("trainer_id","day_of_week");--> statement-breakpoint
CREATE INDEX "trainer_avail_trainer_day_board_idx" ON "trainer_availability" ("trainer_id","day_of_week","board_id");--> statement-breakpoint
ALTER TABLE "service_trainer_assignments" ADD CONSTRAINT "service_trainer_assignments_trainer_id_trainers_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trainer_availability" ADD CONSTRAINT "trainer_availability_trainer_id_trainers_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "time_blocks" ADD CONSTRAINT "time_blocks_trainer_id_trainers_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE;