ALTER TABLE "lesson_series" RENAME COLUMN "trainer_member_id" TO "trainer_id";--> statement-breakpoint
ALTER TABLE "lesson_instances" RENAME COLUMN "trainer_member_id" TO "trainer_id";--> statement-breakpoint
ALTER TABLE "lesson_instance_enrollments" RENAME COLUMN "rider_member_id" TO "rider_id";--> statement-breakpoint
ALTER TABLE "lesson_series_enrollments" RENAME COLUMN "rider_member_id" TO "rider_id";