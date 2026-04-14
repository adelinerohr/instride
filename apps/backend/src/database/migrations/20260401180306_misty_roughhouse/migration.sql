CREATE TYPE "membership_capability" AS ENUM('rider', 'guardian', 'dependent');--> statement-breakpoint
CREATE TYPE "membership_role" AS ENUM('admin', 'member', 'trainer');--> statement-breakpoint
CREATE TYPE "day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
CREATE TYPE "recurrence_frequency" AS ENUM('weekly', 'biweekly');--> statement-breakpoint
CREATE TYPE "series_status" AS ENUM('active', 'paused', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "instance_status" AS ENUM('scheduled', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "instance_enrollment_status" AS ENUM('enrolled', 'waitlisted', 'cancelled', 'attended', 'no_show');--> statement-breakpoint
CREATE TYPE "series_enrollment_status" AS ENUM('active', 'paused', 'cancelled');--> statement-breakpoint
CREATE TYPE "invitation_status" AS ENUM('pending', 'accepted', 'declined', 'expired', 'revoked');--> statement-breakpoint
CREATE TABLE "auth_users" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"phone" text,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text,
	"impersonated_by" text,
	"active_organization_id" text
);
--> statement-breakpoint
CREATE TABLE "auth_accounts" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_verifications" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_members" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"auth_member_id" text NOT NULL UNIQUE,
	"organization_id" uuid NOT NULL,
	"roles" "membership_role"[] DEFAULT '{member}'::"membership_role"[] NOT NULL,
	"capabilities" "membership_capability"[] DEFAULT '{rider}'::"membership_capability"[] NOT NULL,
	"onboarding_complete" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
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
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trainers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"member_id" uuid NOT NULL UNIQUE,
	"organization_id" uuid NOT NULL,
	"bio" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_organizations" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"logo" text,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"auth_organization_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"logo_url" text,
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
	"allows_public_join" boolean DEFAULT false NOT NULL,
	"allow_same_day_bookings" boolean DEFAULT false NOT NULL,
	"allow_public_join" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_invitations" (
	"id" text PRIMARY KEY,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" text NOT NULL
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
CREATE TABLE "boards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"can_rider_add" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "board_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"board_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"is_trainer" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_board_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"service_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"board_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_trainer_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"service_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"credit_price" integer NOT NULL,
	"credit_additional_price" integer,
	"duration" integer NOT NULL,
	"max_riders" integer NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"can_recur_book" boolean DEFAULT false NOT NULL,
	"is_restricted" boolean DEFAULT false NOT NULL,
	"restricted_to_level_id" uuid,
	"is_all_trainers" boolean DEFAULT true NOT NULL,
	"can_rider_add" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_series" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"board_id" uuid NOT NULL,
	"trainer_member_id" uuid NOT NULL,
	"level_id" uuid,
	"service_id" uuid NOT NULL,
	"name" text,
	"notes" text,
	"start" timestamp with time zone NOT NULL,
	"duration" integer NOT NULL,
	"max_riders" integer NOT NULL,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"recurrence_frequency" "recurrence_frequency",
	"recurrence_by_day" "day_of_week"[],
	"recurrence_end" date,
	"status" "series_status" DEFAULT 'active'::"series_status" NOT NULL,
	"effective_from" date,
	"last_planned_until" date,
	"created_by_member_id" uuid,
	"updated_by_member_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"series_id" uuid NOT NULL,
	"board_id" uuid NOT NULL,
	"trainer_member_id" uuid NOT NULL,
	"level_id" uuid,
	"service_id" uuid NOT NULL,
	"start" timestamp with time zone NOT NULL,
	"end" timestamp with time zone NOT NULL,
	"max_riders" integer NOT NULL,
	"occurrence_key" text NOT NULL UNIQUE,
	"status" "instance_status" DEFAULT 'scheduled'::"instance_status" NOT NULL,
	"canceled_at" timestamp with time zone,
	"canceled_by_member_id" uuid,
	"cancel_reason" text,
	"name" text,
	"notes" text,
	"created_by_member_id" uuid,
	"updated_by_member_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_instance_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"instance_id" uuid NOT NULL,
	"rider_member_id" uuid NOT NULL,
	"status" "instance_enrollment_status" DEFAULT 'enrolled'::"instance_enrollment_status" NOT NULL,
	"waitlist_position" integer,
	"attended" boolean,
	"attended_at" timestamp with time zone,
	"marked_by_member_profile_id" uuid,
	"from_series_enrollment_id" uuid,
	"enrolled_by_member_id" uuid,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unenrolled_at" timestamp with time zone,
	"unenrolled_by_member_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_series_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"series_id" uuid NOT NULL,
	"rider_member_id" uuid NOT NULL,
	"status" "series_enrollment_status" DEFAULT 'active'::"series_enrollment_status" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"enrolled_by_member_id" uuid,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"ended_by_member_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"board_id" uuid,
	"day_of_week" "day_of_week" NOT NULL,
	"start_time" integer NOT NULL,
	"end_time" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trainer_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"board_id" uuid,
	"day_of_week" "day_of_week" NOT NULL,
	"start_time" integer NOT NULL,
	"end_time" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"trainer_member_id" uuid NOT NULL,
	"board_id" uuid,
	"start" timestamp with time zone NOT NULL,
	"end" timestamp with time zone NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"author_member_id" uuid NOT NULL,
	"board_id" uuid,
	"text" text NOT NULL,
	"media_urls" text[],
	"deleted_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"post_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"post_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"parent_comment_id" uuid,
	"text" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questionnaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"default_board_id" uuid,
	"questions" jsonb DEFAULT '[]' NOT NULL,
	"board_assignment_rules" jsonb DEFAULT '[]' NOT NULL,
	"created_by_member_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questionnaire_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"questionnaire_id" uuid NOT NULL,
	"questionnaire_version" integer NOT NULL,
	"organization_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"responses" jsonb DEFAULT '[]' NOT NULL,
	"assigned_board_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guardian_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"guardian_member_id" uuid NOT NULL,
	"dependent_member_id" uuid NOT NULL,
	"can_book_lessons" boolean DEFAULT true NOT NULL,
	"can_post_on_feed" boolean DEFAULT false NOT NULL,
	"coppa_consent_given" boolean DEFAULT false NOT NULL,
	"coppa_consent_given_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guardian_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"relationship_id" uuid NOT NULL,
	"token" text NOT NULL UNIQUE,
	"email" text NOT NULL,
	"status" "invitation_status" DEFAULT 'pending'::"invitation_status" NOT NULL,
	"last_sent_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"signed_by" text,
	"terms_agreed" boolean DEFAULT false NOT NULL,
	"signature_acknowledgement" boolean DEFAULT false NOT NULL,
	"signed_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "authUsers_email_idx" ON "auth_users" ("email");--> statement-breakpoint
CREATE INDEX "authSessions_userId_idx" ON "auth_sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "authAccounts_userId_idx" ON "auth_accounts" ("user_id");--> statement-breakpoint
CREATE INDEX "authVerifications_identifier_idx" ON "auth_verifications" ("identifier");--> statement-breakpoint
CREATE INDEX "authMembers_organizationId_idx" ON "auth_members" ("organization_id");--> statement-breakpoint
CREATE INDEX "authMembers_userId_idx" ON "auth_members" ("user_id");--> statement-breakpoint
CREATE INDEX "members_userId_idx" ON "members" ("user_id");--> statement-breakpoint
CREATE INDEX "members_authMemberId_idx" ON "members" ("auth_member_id");--> statement-breakpoint
CREATE INDEX "members_organizationId_idx" ON "members" ("organization_id");--> statement-breakpoint
CREATE INDEX "rider_profiles_memberId_idx" ON "riders" ("member_id");--> statement-breakpoint
CREATE INDEX "rider_profiles_organizationId_idx" ON "riders" ("organization_id");--> statement-breakpoint
CREATE INDEX "trainers_memberId_idx" ON "trainers" ("member_id");--> statement-breakpoint
CREATE INDEX "trainers_organizationId_idx" ON "trainers" ("organization_id");--> statement-breakpoint
CREATE INDEX "organizations_slug_idx" ON "organizations" ("slug");--> statement-breakpoint
CREATE INDEX "organizations_authOrganizationId_idx" ON "organizations" ("auth_organization_id");--> statement-breakpoint
CREATE INDEX "authInvitations_organizationId_idx" ON "auth_invitations" ("organization_id");--> statement-breakpoint
CREATE INDEX "authInvitations_email_idx" ON "auth_invitations" ("email");--> statement-breakpoint
CREATE INDEX "levels_organizationId_idx" ON "levels" ("organization_id");--> statement-breakpoint
CREATE INDEX "boards_organizationId_idx" ON "boards" ("organization_id");--> statement-breakpoint
CREATE INDEX "board_assignments_board_id_idx" ON "board_assignments" ("board_id");--> statement-breakpoint
CREATE INDEX "board_assignments_organizationId_idx" ON "board_assignments" ("organization_id");--> statement-breakpoint
CREATE INDEX "board_assignments_memberId_idx" ON "board_assignments" ("member_id");--> statement-breakpoint
CREATE INDEX "board_assignments_board_role_idx" ON "board_assignments" ("board_id","is_trainer");--> statement-breakpoint
CREATE INDEX "board_assignments_member_role_idx" ON "board_assignments" ("member_id","is_trainer");--> statement-breakpoint
CREATE UNIQUE INDEX "board_assignments_unique_idx" ON "board_assignments" ("board_id","member_id","is_trainer");--> statement-breakpoint
CREATE INDEX "sba_service_id_idx" ON "service_board_assignments" ("service_id");--> statement-breakpoint
CREATE INDEX "sba_organizationId_idx" ON "service_board_assignments" ("organization_id");--> statement-breakpoint
CREATE INDEX "sba_board_id_idx" ON "service_board_assignments" ("board_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sba_unique_idx" ON "service_board_assignments" ("service_id","board_id");--> statement-breakpoint
CREATE INDEX "sta_service_id_idx" ON "service_trainer_assignments" ("service_id");--> statement-breakpoint
CREATE INDEX "sta_organizationId_idx" ON "service_trainer_assignments" ("organization_id");--> statement-breakpoint
CREATE INDEX "sta_memberId_idx" ON "service_trainer_assignments" ("member_id");--> statement-breakpoint
CREATE INDEX "sta_active_idx" ON "service_trainer_assignments" ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "sta_unique_idx" ON "service_trainer_assignments" ("service_id","member_id");--> statement-breakpoint
CREATE INDEX "services_organizationId_idx" ON "services" ("organization_id");--> statement-breakpoint
CREATE INDEX "services_organizationId_active_idx" ON "services" ("organization_id","is_active");--> statement-breakpoint
CREATE INDEX "lesson_series_organizationId_idx" ON "lesson_series" ("organization_id");--> statement-breakpoint
CREATE INDEX "lesson_series_organizationId_status_idx" ON "lesson_series" ("organization_id","status");--> statement-breakpoint
CREATE INDEX "lesson_series_board_id_idx" ON "lesson_series" ("board_id");--> statement-breakpoint
CREATE INDEX "lesson_series_trainer_idx" ON "lesson_series" ("trainer_member_id");--> statement-breakpoint
CREATE INDEX "lesson_series_trainer_status_idx" ON "lesson_series" ("trainer_member_id","status");--> statement-breakpoint
CREATE INDEX "lesson_instances_organizationId_idx" ON "lesson_instances" ("organization_id");--> statement-breakpoint
CREATE INDEX "lesson_instances_organizationId_start_idx" ON "lesson_instances" ("organization_id","start");--> statement-breakpoint
CREATE INDEX "lesson_instances_organizationId_status_idx" ON "lesson_instances" ("organization_id","status");--> statement-breakpoint
CREATE INDEX "lesson_instances_series_id_idx" ON "lesson_instances" ("series_id");--> statement-breakpoint
CREATE INDEX "lesson_instances_board_id_idx" ON "lesson_instances" ("board_id");--> statement-breakpoint
CREATE INDEX "lesson_instances_board_start_idx" ON "lesson_instances" ("board_id","start");--> statement-breakpoint
CREATE INDEX "lesson_instances_trainer_idx" ON "lesson_instances" ("trainer_member_id");--> statement-breakpoint
CREATE INDEX "lesson_instances_trainer_start_idx" ON "lesson_instances" ("trainer_member_id","start");--> statement-breakpoint
CREATE INDEX "lesson_instances_trainer_status_start_idx" ON "lesson_instances" ("trainer_member_id","status","start");--> statement-breakpoint
CREATE INDEX "lie_organizationId_idx" ON "lesson_instance_enrollments" ("organization_id");--> statement-breakpoint
CREATE INDEX "lie_organizationId_rider_idx" ON "lesson_instance_enrollments" ("organization_id","rider_member_id");--> statement-breakpoint
CREATE INDEX "lie_organizationId_status_idx" ON "lesson_instance_enrollments" ("organization_id","status");--> statement-breakpoint
CREATE INDEX "lie_instance_id_idx" ON "lesson_instance_enrollments" ("instance_id");--> statement-breakpoint
CREATE INDEX "lie_instance_status_idx" ON "lesson_instance_enrollments" ("instance_id","status");--> statement-breakpoint
CREATE INDEX "lie_rider_idx" ON "lesson_instance_enrollments" ("rider_member_id");--> statement-breakpoint
CREATE INDEX "lie_rider_status_idx" ON "lesson_instance_enrollments" ("rider_member_id","status");--> statement-breakpoint
CREATE INDEX "lie_series_enrollment_idx" ON "lesson_instance_enrollments" ("from_series_enrollment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lie_instance_rider_unique_idx" ON "lesson_instance_enrollments" ("instance_id","rider_member_id");--> statement-breakpoint
CREATE INDEX "lse_organizationId_idx" ON "lesson_series_enrollments" ("organization_id");--> statement-breakpoint
CREATE INDEX "lse_organizationId_rider_idx" ON "lesson_series_enrollments" ("organization_id","rider_member_id");--> statement-breakpoint
CREATE INDEX "lse_series_id_idx" ON "lesson_series_enrollments" ("series_id");--> statement-breakpoint
CREATE INDEX "lse_series_status_idx" ON "lesson_series_enrollments" ("series_id","status");--> statement-breakpoint
CREATE INDEX "lse_rider_idx" ON "lesson_series_enrollments" ("rider_member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lse_series_rider_unique_idx" ON "lesson_series_enrollments" ("series_id","rider_member_id");--> statement-breakpoint
CREATE INDEX "org_avail_organization_idx" ON "organization_availability" ("organization_id");--> statement-breakpoint
CREATE INDEX "org_avail_organization_day_idx" ON "organization_availability" ("organization_id","day_of_week");--> statement-breakpoint
CREATE INDEX "org_avail_board_idx" ON "organization_availability" ("board_id");--> statement-breakpoint
CREATE INDEX "org_avail_organization_board_idx" ON "organization_availability" ("organization_id","board_id");--> statement-breakpoint
CREATE INDEX "org_avail_organization_day_board_idx" ON "organization_availability" ("organization_id","day_of_week","board_id");--> statement-breakpoint
CREATE INDEX "trainer_avail_organization_idx" ON "trainer_availability" ("organization_id");--> statement-breakpoint
CREATE INDEX "trainer_avail_organization_member_idx" ON "trainer_availability" ("organization_id","member_id");--> statement-breakpoint
CREATE INDEX "trainer_avail_member_idx" ON "trainer_availability" ("member_id");--> statement-breakpoint
CREATE INDEX "trainer_avail_board_idx" ON "trainer_availability" ("board_id");--> statement-breakpoint
CREATE INDEX "trainer_avail_member_board_idx" ON "trainer_availability" ("member_id","board_id");--> statement-breakpoint
CREATE INDEX "trainer_avail_member_day_idx" ON "trainer_availability" ("member_id","day_of_week");--> statement-breakpoint
CREATE INDEX "trainer_avail_member_day_board_idx" ON "trainer_availability" ("member_id","day_of_week","board_id");--> statement-breakpoint
CREATE INDEX "time_blocks_organization_idx" ON "time_blocks" ("organization_id");--> statement-breakpoint
CREATE INDEX "time_blocks_trainer_idx" ON "time_blocks" ("trainer_member_id");--> statement-breakpoint
CREATE INDEX "time_blocks_board_idx" ON "time_blocks" ("board_id");--> statement-breakpoint
CREATE INDEX "time_blocks_trainer_board_idx" ON "time_blocks" ("trainer_member_id","board_id");--> statement-breakpoint
CREATE INDEX "time_blocks_organization_start_idx" ON "time_blocks" ("organization_id","start");--> statement-breakpoint
CREATE INDEX "feed_posts_organizationId_idx" ON "feed_posts" ("organization_id");--> statement-breakpoint
CREATE INDEX "feed_posts_authorMemberId_idx" ON "feed_posts" ("author_member_id");--> statement-breakpoint
CREATE INDEX "feed_posts_board_idx" ON "feed_posts" ("board_id");--> statement-breakpoint
CREATE INDEX "feed_posts_organizationId_boardId_idx" ON "feed_posts" ("organization_id","board_id");--> statement-breakpoint
CREATE INDEX "feed_posts_organizationId_authorMemberId_idx" ON "feed_posts" ("organization_id","author_member_id");--> statement-breakpoint
CREATE INDEX "feed_likes_post_idx" ON "feed_likes" ("post_id");--> statement-breakpoint
CREATE INDEX "feed_likes_memberId_idx" ON "feed_likes" ("member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "feed_likes_unique_idx" ON "feed_likes" ("post_id","member_id");--> statement-breakpoint
CREATE INDEX "feed_comments_post_idx" ON "feed_comments" ("post_id");--> statement-breakpoint
CREATE INDEX "feed_comments_memberId_idx" ON "feed_comments" ("member_id");--> statement-breakpoint
CREATE INDEX "feed_comments_parent_idx" ON "feed_comments" ("parent_comment_id");--> statement-breakpoint
CREATE INDEX "questionnaires_organization_idx" ON "questionnaires" ("organization_id");--> statement-breakpoint
CREATE INDEX "questionnaires_organization_active_idx" ON "questionnaires" ("organization_id","is_active");--> statement-breakpoint
CREATE INDEX "qr_organization_idx" ON "questionnaire_responses" ("organization_id");--> statement-breakpoint
CREATE INDEX "qr_member_idx" ON "questionnaire_responses" ("member_id");--> statement-breakpoint
CREATE INDEX "qr_questionnaire_idx" ON "questionnaire_responses" ("questionnaire_id");--> statement-breakpoint
CREATE INDEX "qr_organization_member_idx" ON "questionnaire_responses" ("organization_id","member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "qr_member_questionnaire_unique_idx" ON "questionnaire_responses" ("member_id","questionnaire_id");--> statement-breakpoint
CREATE INDEX "guardian_rel_organization_idx" ON "guardian_relationships" ("organization_id");--> statement-breakpoint
CREATE INDEX "guardian_rel_guardian_organization_idx" ON "guardian_relationships" ("guardian_member_id","organization_id");--> statement-breakpoint
CREATE INDEX "guardian_rel_dependent_organization_idx" ON "guardian_relationships" ("dependent_member_id","organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "guardian_rel_unique_idx" ON "guardian_relationships" ("guardian_member_id","dependent_member_id","organization_id");--> statement-breakpoint
CREATE INDEX "guardian_inv_relationship_idx" ON "guardian_invitations" ("relationship_id");--> statement-breakpoint
CREATE INDEX "guardian_inv_token_idx" ON "guardian_invitations" ("token");--> statement-breakpoint
CREATE INDEX "guardian_inv_email_status_idx" ON "guardian_invitations" ("email","status");--> statement-breakpoint
CREATE INDEX "waivers_organization_idx" ON "waivers" ("organization_id");--> statement-breakpoint
CREATE INDEX "waivers_member_idx" ON "waivers" ("member_id");--> statement-breakpoint
CREATE INDEX "waivers_organization_member_idx" ON "waivers" ("organization_id","member_id");--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_auth_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_auth_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth_members" ADD CONSTRAINT "auth_members_user_id_auth_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth_members" ADD CONSTRAINT "auth_members_organization_id_auth_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "auth_organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_auth_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_auth_member_id_auth_members_id_fkey" FOREIGN KEY ("auth_member_id") REFERENCES "auth_members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");--> statement-breakpoint
ALTER TABLE "riders" ADD CONSTRAINT "riders_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "riders" ADD CONSTRAINT "riders_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");--> statement-breakpoint
ALTER TABLE "riders" ADD CONSTRAINT "riders_riding_level_id_levels_id_fkey" FOREIGN KEY ("riding_level_id") REFERENCES "levels"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_auth_organization_id_auth_organizations_id_fkey" FOREIGN KEY ("auth_organization_id") REFERENCES "auth_organizations"("id");--> statement-breakpoint
ALTER TABLE "auth_invitations" ADD CONSTRAINT "auth_invitations_organization_id_auth_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "auth_organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth_invitations" ADD CONSTRAINT "auth_invitations_inviter_id_auth_users_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "auth_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "boards" ADD CONSTRAINT "boards_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "board_assignments" ADD CONSTRAINT "board_assignments_board_id_boards_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "board_assignments" ADD CONSTRAINT "board_assignments_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "board_assignments" ADD CONSTRAINT "board_assignments_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "service_board_assignments" ADD CONSTRAINT "service_board_assignments_service_id_services_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "service_board_assignments" ADD CONSTRAINT "service_board_assignments_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "service_board_assignments" ADD CONSTRAINT "service_board_assignments_board_id_boards_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "service_trainer_assignments" ADD CONSTRAINT "service_trainer_assignments_service_id_services_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "service_trainer_assignments" ADD CONSTRAINT "service_trainer_assignments_zAU6AiWtd1tn_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "service_trainer_assignments" ADD CONSTRAINT "service_trainer_assignments_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_restricted_to_level_id_levels_id_fkey" FOREIGN KEY ("restricted_to_level_id") REFERENCES "levels"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson_series" ADD CONSTRAINT "lesson_series_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_series" ADD CONSTRAINT "lesson_series_board_id_boards_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "lesson_series" ADD CONSTRAINT "lesson_series_trainer_member_id_members_id_fkey" FOREIGN KEY ("trainer_member_id") REFERENCES "members"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "lesson_series" ADD CONSTRAINT "lesson_series_level_id_levels_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson_series" ADD CONSTRAINT "lesson_series_service_id_services_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "lesson_series" ADD CONSTRAINT "lesson_series_created_by_member_id_members_id_fkey" FOREIGN KEY ("created_by_member_id") REFERENCES "members"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson_series" ADD CONSTRAINT "lesson_series_updated_by_member_id_members_id_fkey" FOREIGN KEY ("updated_by_member_id") REFERENCES "members"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson_instances" ADD CONSTRAINT "lesson_instances_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_instances" ADD CONSTRAINT "lesson_instances_series_id_lesson_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "lesson_series"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_instances" ADD CONSTRAINT "lesson_instances_board_id_boards_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "lesson_instances" ADD CONSTRAINT "lesson_instances_trainer_member_id_members_id_fkey" FOREIGN KEY ("trainer_member_id") REFERENCES "members"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "lesson_instances" ADD CONSTRAINT "lesson_instances_level_id_levels_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson_instances" ADD CONSTRAINT "lesson_instances_service_id_services_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "lesson_instances" ADD CONSTRAINT "lesson_instances_canceled_by_member_id_members_id_fkey" FOREIGN KEY ("canceled_by_member_id") REFERENCES "members"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson_instances" ADD CONSTRAINT "lesson_instances_created_by_member_id_members_id_fkey" FOREIGN KEY ("created_by_member_id") REFERENCES "members"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson_instances" ADD CONSTRAINT "lesson_instances_updated_by_member_id_members_id_fkey" FOREIGN KEY ("updated_by_member_id") REFERENCES "members"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson_instance_enrollments" ADD CONSTRAINT "lesson_instance_enrollments_X4kZ0hCxN5GP_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_instance_enrollments" ADD CONSTRAINT "lesson_instance_enrollments_K5d1eA7V80LI_fkey" FOREIGN KEY ("instance_id") REFERENCES "lesson_instances"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_instance_enrollments" ADD CONSTRAINT "lesson_instance_enrollments_rider_member_id_members_id_fkey" FOREIGN KEY ("rider_member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_instance_enrollments" ADD CONSTRAINT "lesson_instance_enrollments_OuDfOc9Hbl9Y_fkey" FOREIGN KEY ("marked_by_member_profile_id") REFERENCES "members"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson_instance_enrollments" ADD CONSTRAINT "lesson_instance_enrollments_l0Ow9UhFaXA3_fkey" FOREIGN KEY ("from_series_enrollment_id") REFERENCES "lesson_series_enrollments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson_instance_enrollments" ADD CONSTRAINT "lesson_instance_enrollments_aJJ6dK1odDBd_fkey" FOREIGN KEY ("enrolled_by_member_id") REFERENCES "members"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson_instance_enrollments" ADD CONSTRAINT "lesson_instance_enrollments_0K39q9lNHpui_fkey" FOREIGN KEY ("unenrolled_by_member_id") REFERENCES "members"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson_series_enrollments" ADD CONSTRAINT "lesson_series_enrollments_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_series_enrollments" ADD CONSTRAINT "lesson_series_enrollments_series_id_lesson_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "lesson_series"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_series_enrollments" ADD CONSTRAINT "lesson_series_enrollments_rider_member_id_members_id_fkey" FOREIGN KEY ("rider_member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "lesson_series_enrollments" ADD CONSTRAINT "lesson_series_enrollments_enrolled_by_member_id_members_id_fkey" FOREIGN KEY ("enrolled_by_member_id") REFERENCES "members"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lesson_series_enrollments" ADD CONSTRAINT "lesson_series_enrollments_ended_by_member_id_members_id_fkey" FOREIGN KEY ("ended_by_member_id") REFERENCES "members"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "organization_availability" ADD CONSTRAINT "organization_availability_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization_availability" ADD CONSTRAINT "organization_availability_board_id_boards_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trainer_availability" ADD CONSTRAINT "trainer_availability_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trainer_availability" ADD CONSTRAINT "trainer_availability_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "trainer_availability" ADD CONSTRAINT "trainer_availability_board_id_boards_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "time_blocks" ADD CONSTRAINT "time_blocks_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "time_blocks" ADD CONSTRAINT "time_blocks_trainer_member_id_members_id_fkey" FOREIGN KEY ("trainer_member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "time_blocks" ADD CONSTRAINT "time_blocks_board_id_boards_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feed_posts" ADD CONSTRAINT "feed_posts_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feed_posts" ADD CONSTRAINT "feed_posts_author_member_id_members_id_fkey" FOREIGN KEY ("author_member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feed_posts" ADD CONSTRAINT "feed_posts_board_id_boards_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "feed_likes" ADD CONSTRAINT "feed_likes_post_id_feed_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "feed_posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feed_likes" ADD CONSTRAINT "feed_likes_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feed_comments" ADD CONSTRAINT "feed_comments_post_id_feed_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "feed_posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feed_comments" ADD CONSTRAINT "feed_comments_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feed_comments" ADD CONSTRAINT "feed_comments_parent_comment_id_feed_comments_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "feed_comments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "questionnaires" ADD CONSTRAINT "questionnaires_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "questionnaires" ADD CONSTRAINT "questionnaires_default_board_id_boards_id_fkey" FOREIGN KEY ("default_board_id") REFERENCES "boards"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "questionnaires" ADD CONSTRAINT "questionnaires_created_by_member_id_members_id_fkey" FOREIGN KEY ("created_by_member_id") REFERENCES "members"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_questionnaire_id_questionnaires_id_fkey" FOREIGN KEY ("questionnaire_id") REFERENCES "questionnaires"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "guardian_relationships" ADD CONSTRAINT "guardian_relationships_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "guardian_relationships" ADD CONSTRAINT "guardian_relationships_guardian_member_id_members_id_fkey" FOREIGN KEY ("guardian_member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "guardian_relationships" ADD CONSTRAINT "guardian_relationships_dependent_member_id_members_id_fkey" FOREIGN KEY ("dependent_member_id") REFERENCES "members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "guardian_invitations" ADD CONSTRAINT "guardian_invitations_vOvzJoVpeHdt_fkey" FOREIGN KEY ("relationship_id") REFERENCES "guardian_relationships"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "waivers" ADD CONSTRAINT "waivers_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "waivers" ADD CONSTRAINT "waivers_member_id_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE;