CREATE TYPE "waiver_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TABLE "waiver_signatures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"waiver_id" uuid NOT NULL,
	"waiver_version" text NOT NULL,
	"signer_member_id" uuid NOT NULL,
	"on_behalf_of_member_id" uuid,
	"signed_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"is_valid" boolean DEFAULT true NOT NULL,
	"invalidated_at" timestamp,
	"invalidated_reason" text
);
--> statement-breakpoint
ALTER TABLE "waivers" DROP CONSTRAINT "waivers_member_id_members_id_fkey";--> statement-breakpoint
DROP INDEX "waivers_member_idx";--> statement-breakpoint
DROP INDEX "waivers_organization_member_idx";--> statement-breakpoint
ALTER TABLE "waivers" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "waivers" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
ALTER TABLE "waivers" ADD COLUMN "version" text DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE "waivers" ADD COLUMN "status" "waiver_status" DEFAULT 'active'::"waiver_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "waivers" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "waivers" DROP COLUMN "member_id";--> statement-breakpoint
ALTER TABLE "waivers" DROP COLUMN "signed_by";--> statement-breakpoint
ALTER TABLE "waivers" DROP COLUMN "terms_agreed";--> statement-breakpoint
ALTER TABLE "waivers" DROP COLUMN "signature_acknowledgement";--> statement-breakpoint
ALTER TABLE "waivers" DROP COLUMN "signed_at";--> statement-breakpoint
ALTER TABLE "waivers" DROP COLUMN "ip_address";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "allows_public_join";--> statement-breakpoint
ALTER TABLE "lesson_series" ALTER COLUMN "recurrence_end" SET DATA TYPE timestamp with time zone USING "recurrence_end"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lesson_series" ALTER COLUMN "effective_from" SET DATA TYPE timestamp with time zone USING "effective_from"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "lesson_series" ALTER COLUMN "last_planned_until" SET DATA TYPE timestamp with time zone USING "last_planned_until"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "waiver_signatures" ADD CONSTRAINT "waiver_signatures_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");--> statement-breakpoint
ALTER TABLE "waiver_signatures" ADD CONSTRAINT "waiver_signatures_waiver_id_waivers_id_fkey" FOREIGN KEY ("waiver_id") REFERENCES "waivers"("id");--> statement-breakpoint
ALTER TABLE "waiver_signatures" ADD CONSTRAINT "waiver_signatures_signer_member_id_members_id_fkey" FOREIGN KEY ("signer_member_id") REFERENCES "members"("id");--> statement-breakpoint
ALTER TABLE "waiver_signatures" ADD CONSTRAINT "waiver_signatures_on_behalf_of_member_id_members_id_fkey" FOREIGN KEY ("on_behalf_of_member_id") REFERENCES "members"("id");