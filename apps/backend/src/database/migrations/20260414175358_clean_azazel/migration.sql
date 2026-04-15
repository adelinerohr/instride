CREATE TYPE "kiosk_scope" AS ENUM('default', 'rider', 'trainer', 'admin');--> statement-breakpoint
CREATE TABLE "kiosk_acting_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"acting_for_member_id" uuid NOT NULL,
	"scope" "kiosk_scope" DEFAULT 'default'::"kiosk_scope" NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kiosk_acting_tokens" ADD CONSTRAINT "kiosk_acting_tokens_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "kiosk_acting_tokens" ADD CONSTRAINT "kiosk_acting_tokens_acting_for_member_id_members_id_fkey" FOREIGN KEY ("acting_for_member_id") REFERENCES "members"("id") ON DELETE CASCADE;