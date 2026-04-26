ALTER TABLE "auth_invitations" ADD COLUMN "roles" "membership_role"[] DEFAULT '{rider}'::"membership_role"[] NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_invitations" DROP COLUMN "role";--> statement-breakpoint
ALTER TABLE "auth_invitations" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "auth_invitations" ALTER COLUMN "status" SET DATA TYPE "invitation_status" USING "status"::"invitation_status";--> statement-breakpoint
ALTER TABLE "auth_invitations" ALTER COLUMN "status" SET DEFAULT 'pending'::"invitation_status";--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.conname = 'trainer_avail_trainer_board_day_unique'
      AND t.relname = 'trainer_availability'
      AND n.nspname = 'public'
  ) THEN
    ALTER TABLE "trainer_availability"
      ADD CONSTRAINT "trainer_avail_trainer_board_day_unique"
      UNIQUE NULLS NOT DISTINCT ("trainer_id","board_id","day_of_week");
  END IF;
END$$;