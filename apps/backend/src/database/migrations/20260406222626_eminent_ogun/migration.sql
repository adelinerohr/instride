ALTER TABLE "riders" ADD COLUMN "is_restricted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "riders" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "trainers" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "roles" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "roles" DROP DEFAULT;--> statement-breakpoint
DROP TYPE "membership_role";--> statement-breakpoint
CREATE TYPE "membership_role" AS ENUM('admin', 'rider', 'trainer', 'guardian');--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "roles" SET DATA TYPE "membership_role"[] USING "roles"::"membership_role"[];--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "roles" SET DEFAULT '{rider}'::"membership_role"[];--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN "capabilities";