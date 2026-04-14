ALTER TABLE "board_assignments" DROP CONSTRAINT "board_assignments_trainer_id_members_id_fkey";--> statement-breakpoint
ALTER TABLE "board_assignments" DROP CONSTRAINT "board_assignments_rider_id_members_id_fkey";--> statement-breakpoint
ALTER TABLE "board_assignments" ADD CONSTRAINT "board_assignments_trainer_id_trainers_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "board_assignments" ADD CONSTRAINT "board_assignments_rider_id_riders_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE CASCADE;