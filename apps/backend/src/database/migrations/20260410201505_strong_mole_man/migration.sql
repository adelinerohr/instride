ALTER TABLE "lesson_series" DROP CONSTRAINT "lesson_series_trainer_member_id_members_id_fkey";--> statement-breakpoint
ALTER TABLE "lesson_instances" DROP CONSTRAINT "lesson_instances_trainer_member_id_members_id_fkey";--> statement-breakpoint
ALTER TABLE "lesson_series" ADD CONSTRAINT "lesson_series_trainer_id_trainers_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "lesson_instances" ADD CONSTRAINT "lesson_instances_trainer_id_trainers_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE RESTRICT;