ALTER TABLE "kiosk_acting_tokens" ALTER COLUMN "scope" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "kiosk_acting_tokens" ALTER COLUMN "scope" DROP DEFAULT;--> statement-breakpoint
DROP TYPE "kiosk_scope";--> statement-breakpoint
CREATE TYPE "kiosk_scope" AS ENUM('default', 'staff', 'self');--> statement-breakpoint
ALTER TABLE "kiosk_acting_tokens" ALTER COLUMN "scope" SET DATA TYPE "kiosk_scope" USING "scope"::"kiosk_scope";--> statement-breakpoint
ALTER TABLE "kiosk_acting_tokens" ALTER COLUMN "scope" SET DEFAULT 'default'::"kiosk_scope";--> statement-breakpoint
ALTER TABLE "kiosk_acting_tokens" ALTER COLUMN "acting_for_member_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "kiosk_acting_tokens" ALTER COLUMN "expires_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "kiosk_acting_tokens" DROP CONSTRAINT "kiosk_acting_tokens_acting_for_member_id_members_id_fkey", ADD CONSTRAINT "kiosk_acting_tokens_acting_for_member_id_members_id_fkey" FOREIGN KEY ("acting_for_member_id") REFERENCES "members"("id") ON DELETE SET NULL;