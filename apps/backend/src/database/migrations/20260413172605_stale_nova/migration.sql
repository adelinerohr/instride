ALTER TABLE "lesson_instance_enrollments" DROP CONSTRAINT "lesson_instance_enrollments_rider_member_id_members_id_fkey";--> statement-breakpoint
ALTER TABLE "lesson_series_enrollments" DROP CONSTRAINT "lesson_series_enrollments_rider_member_id_members_id_fkey";--> statement-breakpoint
ALTER TABLE "guardian_invitations" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "guardian_invitations" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
DROP TYPE "invitation_status";--> statement-breakpoint
CREATE TYPE "invitation_status" AS ENUM('pending', 'accepted', 'rejected', 'cancelled');--> statement-breakpoint
ALTER TABLE "guardian_invitations" ALTER COLUMN "status" SET DATA TYPE "invitation_status" USING "status"::"invitation_status";--> statement-breakpoint
ALTER TABLE "guardian_invitations" ALTER COLUMN "status" SET DEFAULT 'pending'::"invitation_status";--> statement-breakpoint
ALTER TABLE "lesson_instance_enrollments" ADD CONSTRAINT "lesson_instance_enrollments_rider_id_riders_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_series_enrollments" ADD CONSTRAINT "lesson_series_enrollments_rider_id_riders_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE CASCADE;