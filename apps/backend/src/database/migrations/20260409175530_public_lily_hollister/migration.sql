ALTER TABLE "board_assignments" DROP CONSTRAINT "board_assignments_member_id_members_id_fkey";--> statement-breakpoint
DROP INDEX IF EXISTS "board_assignments_memberId_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "board_assignments_member_role_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "board_assignments_unique_idx";--> statement-breakpoint
ALTER TABLE "board_assignments" ADD COLUMN "trainer_id" uuid;--> statement-breakpoint
ALTER TABLE "board_assignments" ADD COLUMN "rider_id" uuid;--> statement-breakpoint
ALTER TABLE "board_assignments" DROP COLUMN "member_id";--> statement-breakpoint
ALTER TABLE "board_assignments" DROP COLUMN "is_trainer";--> statement-breakpoint
DROP INDEX IF EXISTS "board_assignments_board_role_idx";--> statement-breakpoint
CREATE INDEX "board_assignments_board_role_idx" ON "board_assignments" ("board_id","trainer_id","rider_id");--> statement-breakpoint
CREATE INDEX "board_assignments_trainerId_idx" ON "board_assignments" ("trainer_id");--> statement-breakpoint
CREATE INDEX "board_assignments_riderId_idx" ON "board_assignments" ("rider_id");--> statement-breakpoint
ALTER TABLE "board_assignments" ADD CONSTRAINT "board_assignments_trainer_id_members_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "board_assignments" ADD CONSTRAINT "board_assignments_rider_id_members_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "members"("id") ON DELETE CASCADE;