CREATE TYPE "invitation_kind" AS ENUM('member', 'guardian_link', 'dependent_account');--> statement-breakpoint
CREATE TYPE "invitation_status" AS ENUM('pending', 'accepted', 'revoked');--> statement-breakpoint
CREATE TYPE "membership_role" AS ENUM('admin', 'trainer', 'rider');--> statement-breakpoint
CREATE TYPE "dependent_action" AS ENUM('book_lesson', 'join_event', 'cancel_booking', 'post', 'comment', 'edit_profile');--> statement-breakpoint
CREATE TYPE "pending_action_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"token" text NOT NULL UNIQUE,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"impersonated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"image_key" text,
	"phone" text,
	"date_of_birth" text,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"kind" "invitation_kind" DEFAULT 'member'::"invitation_kind" NOT NULL,
	"email" text NOT NULL,
	"roles" "membership_role"[] DEFAULT '{}'::"membership_role"[] NOT NULL,
	"dependent_member_id" uuid,
	"token" text NOT NULL UNIQUE,
	"status" "invitation_status" DEFAULT 'pending'::"invitation_status" NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_dependent_check" CHECK (("kind" = 'member') = ("dependent_member_id" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"user_id" text,
	"roles" "membership_role"[] DEFAULT '{}'::"membership_role"[] NOT NULL,
	"name" text,
	"date_of_birth" date,
	"kiosk_pin" text,
	"onboarding_complete" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "members_identity_check" CHECK ("user_id" IS NOT NULL OR "name" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"logo_url" text,
	"logo_key" text,
	"primary_color" text,
	"phone" text,
	"website" text,
	"facebook" text,
	"instagram" text,
	"youtube" text,
	"tiktok" text,
	"address_line_1" text,
	"address_line_2" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"allow_same_day_bookings" boolean DEFAULT false NOT NULL,
	"allow_public_join" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "riders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"member_id" uuid NOT NULL UNIQUE,
	"organization_id" uuid NOT NULL,
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"riding_level_id" uuid,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trainers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"member_id" uuid NOT NULL UNIQUE,
	"organization_id" uuid NOT NULL,
	"bio" text,
	"allow_same_day_bookings" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dependent_controls" (
	"member_id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"permissions" jsonb DEFAULT '{"bookings":{"canBookLessons":true,"canJoinEvents":true,"canCancel":true,"requiresApproval":true},"communication":{"canPost":true,"canComment":true},"profile":{"canEdit":true}}' NOT NULL,
	"consent_given_at" timestamp,
	"consent_given_by_member_id" uuid,
	"updated_by_member_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guardian_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"guardian_member_id" uuid NOT NULL,
	"dependent_member_id" uuid NOT NULL,
	"revoked_at" timestamp,
	"revoked_by_member_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guardian_rel_not_self" CHECK ("guardian_member_id" <> "dependent_member_id")
);
--> statement-breakpoint
CREATE TABLE "pending_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"dependent_member_id" uuid NOT NULL,
	"action" "dependent_action" NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "pending_action_status" DEFAULT 'pending'::"pending_action_status" NOT NULL,
	"decided_by_member_id" uuid,
	"decided_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" ("identifier");--> statement-breakpoint
CREATE INDEX "invitations_organization_id_idx" ON "invitations" ("organization_id");--> statement-breakpoint
CREATE INDEX "invitations_email_idx" ON "invitations" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "members_org_user_idx" ON "members" ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "members_user_id_idx" ON "members" ("user_id");--> statement-breakpoint
CREATE INDEX "levels_organization_id_idx" ON "levels" ("organization_id");--> statement-breakpoint
CREATE INDEX "riders_organization_id_idx" ON "riders" ("organization_id");--> statement-breakpoint
CREATE INDEX "trainers_organization_id_idx" ON "trainers" ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "guardian_rel_active_pair_idx" ON "guardian_relationships" ("guardian_member_id","dependent_member_id") WHERE "revoked_at" IS NULL;--> statement-breakpoint
CREATE INDEX "guardian_rel_guardian_idx" ON "guardian_relationships" ("guardian_member_id");--> statement-breakpoint
CREATE INDEX "guardian_rel_dependent_idx" ON "guardian_relationships" ("dependent_member_id");--> statement-breakpoint
CREATE INDEX "guardian_rel_organization_idx" ON "guardian_relationships" ("organization_id");--> statement-breakpoint
CREATE INDEX "pending_actions_dependent_status_idx" ON "pending_actions" ("dependent_member_id","status");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_dependent_member_id_members_id_fkey" FOREIGN KEY ("dependent_member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_user_id_users_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "riders" ADD CONSTRAINT "riders_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "riders" ADD CONSTRAINT "riders_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "riders" ADD CONSTRAINT "riders_riding_level_id_levels_id_fkey" FOREIGN KEY ("riding_level_id") REFERENCES "levels"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "dependent_controls" ADD CONSTRAINT "dependent_controls_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "dependent_controls" ADD CONSTRAINT "dependent_controls_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "dependent_controls" ADD CONSTRAINT "dependent_controls_consent_given_by_member_id_members_id_fkey" FOREIGN KEY ("consent_given_by_member_id") REFERENCES "members"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "dependent_controls" ADD CONSTRAINT "dependent_controls_updated_by_member_id_members_id_fkey" FOREIGN KEY ("updated_by_member_id") REFERENCES "members"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "guardian_relationships" ADD CONSTRAINT "guardian_relationships_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "guardian_relationships" ADD CONSTRAINT "guardian_relationships_guardian_member_id_members_id_fkey" FOREIGN KEY ("guardian_member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "guardian_relationships" ADD CONSTRAINT "guardian_relationships_dependent_member_id_members_id_fkey" FOREIGN KEY ("dependent_member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "guardian_relationships" ADD CONSTRAINT "guardian_relationships_revoked_by_member_id_members_id_fkey" FOREIGN KEY ("revoked_by_member_id") REFERENCES "members"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "pending_actions" ADD CONSTRAINT "pending_actions_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pending_actions" ADD CONSTRAINT "pending_actions_dependent_member_id_members_id_fkey" FOREIGN KEY ("dependent_member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pending_actions" ADD CONSTRAINT "pending_actions_decided_by_member_id_members_id_fkey" FOREIGN KEY ("decided_by_member_id") REFERENCES "members"("id") ON DELETE SET NULL;