CREATE TYPE "notification_channel" AS ENUM('email', 'sms', 'push', 'in_app');--> statement-breakpoint
CREATE TYPE "notification_type" AS ENUM('lesson_scheduled', 'lesson_cancelled', 'lesson_reminder', 'new_comment');--> statement-breakpoint
CREATE TYPE "activity_subject_type" AS ENUM('lesson', 'post', 'payment', 'rider', 'trainer', 'other');--> statement-breakpoint
CREATE TYPE "activity_type" AS ENUM('lesson_booked');--> statement-breakpoint
CREATE TABLE "notification_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"notification_id" uuid NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"external_id" text,
	"status" text NOT NULL,
	"error" text,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delivered_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"recipient_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"deep_link" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"member_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"push_enabled" boolean DEFAULT true NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"sms_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_member_id_organization_id_type_unique" UNIQUE("member_id","organization_id","type")
);
--> statement-breakpoint
CREATE TABLE "push_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"member_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"token" text NOT NULL UNIQUE,
	"platform" varchar(10) NOT NULL,
	"app_bundle_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid,
	"actor_member_id" uuid,
	"owner_member_id" uuid NOT NULL,
	"subject_type" "activity_subject_type" NOT NULL,
	"subject_id" uuid NOT NULL,
	"actor_role" "membership_role",
	"type" "activity_type" NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "deliveries_notification_idx" ON "notification_deliveries" ("notification_id");--> statement-breakpoint
CREATE INDEX "notifications_recipient_idx" ON "notifications" ("recipient_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_unread_idx" ON "notifications" ("recipient_id","is_read","created_at");--> statement-breakpoint
CREATE INDEX "notif_prefs_member_type_idx" ON "notification_preferences" ("member_id","type");--> statement-breakpoint
CREATE INDEX "push_tokens_member_idx" ON "push_tokens" ("member_id");--> statement-breakpoint
CREATE INDEX "activity_actorMemberId_idx" ON "activity" ("actor_member_id");--> statement-breakpoint
CREATE INDEX "activity_organizationId_idx" ON "activity" ("organization_id");--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notification_id_notifications_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_members_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id");--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");--> statement-breakpoint
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id");--> statement-breakpoint
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_actor_member_id_members_id_fkey" FOREIGN KEY ("actor_member_id") REFERENCES "members"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_owner_member_id_members_id_fkey" FOREIGN KEY ("owner_member_id") REFERENCES "members"("id") ON DELETE CASCADE;