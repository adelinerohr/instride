ALTER TABLE "activity" ADD COLUMN "trainer_id" uuid;--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "rider_id" uuid;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "notification_preferences" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "notification_type";--> statement-breakpoint
CREATE TYPE "notification_type" AS ENUM('enrollment_created', 'lesson_enrolled', 'lesson_cancelled', 'lesson_reminder', 'post_created', 'comment_added', 'profile_updated', 'credit_package_purchased', 'invoice_paid', 'user_updated');--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE "notification_type" USING "type"::"notification_type";--> statement-breakpoint
ALTER TABLE "notification_preferences" ALTER COLUMN "type" SET DATA TYPE "notification_type" USING "type"::"notification_type";--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "activity_type";--> statement-breakpoint
CREATE TYPE "activity_type" AS ENUM('enrollment_created', 'lesson_completed_as_rider', 'waiver_signed', 'questionnaire_submitted', 'level_updated', 'lesson_taught', 'student_assigned', 'post_created', 'comment_added', 'profile_updated', 'credit_package_purchased', 'invoice_paid', 'user_updated');--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "type" SET DATA TYPE "activity_type" USING "type"::"activity_type";--> statement-breakpoint
ALTER TABLE "activity" DROP COLUMN "actor_role";--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_trainer_id_trainers_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_rider_id_riders_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE SET NULL;