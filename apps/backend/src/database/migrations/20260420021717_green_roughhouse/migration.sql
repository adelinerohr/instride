CREATE TABLE "organization_availability_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"availability_id" uuid NOT NULL,
	"openTime" time with time zone NOT NULL,
	"closeTime" time with time zone NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trainer_availability_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"trainer_availability_id" uuid NOT NULL,
	"openTime" time with time zone NOT NULL,
	"closeTime" time with time zone NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_availability" DROP COLUMN "openTime";--> statement-breakpoint
ALTER TABLE "organization_availability" DROP COLUMN "closeTime";--> statement-breakpoint
ALTER TABLE "trainer_availability" DROP COLUMN "inherits_from_org";--> statement-breakpoint
ALTER TABLE "trainer_availability" DROP COLUMN "openTime";--> statement-breakpoint
ALTER TABLE "trainer_availability" DROP COLUMN "closeTime";--> statement-breakpoint
ALTER TABLE "guardian_relationships" ALTER COLUMN "permissions" SET DEFAULT '{"bookings":{"canBookLessons":true,"canJoinEvents":true,"requiresApproval":true,"canCancel":true},"communication":{"canPost":true,"canComment":true,"receiveEmailNotifications":true,"receiveTextNotifications":true},"profile":{"canEdit":true}}';--> statement-breakpoint
ALTER TABLE "guardian_relationships" ALTER COLUMN "permissions" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "org_avail_slots_availability_idx" ON "organization_availability_slots" ("availability_id");--> statement-breakpoint
CREATE INDEX "trainer_avail_slots_availability_idx" ON "trainer_availability_slots" ("trainer_availability_id");--> statement-breakpoint
ALTER TABLE "organization_availability_slots" ADD CONSTRAINT "organization_availability_slots_G44pIPlQ89IV_fkey" FOREIGN KEY ("availability_id") REFERENCES "organization_availability"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trainer_availability_slots" ADD CONSTRAINT "trainer_availability_slots_bn15XaiOFcJf_fkey" FOREIGN KEY ("trainer_availability_id") REFERENCES "trainer_availability"("id") ON DELETE CASCADE;