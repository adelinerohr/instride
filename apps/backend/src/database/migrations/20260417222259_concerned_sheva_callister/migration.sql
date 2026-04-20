ALTER TABLE "guardian_relationships" ADD COLUMN "permissions" jsonb;--> statement-breakpoint
ALTER TABLE "guardian_relationships" DROP COLUMN "can_book_lessons";--> statement-breakpoint
ALTER TABLE "guardian_relationships" DROP COLUMN "can_post_on_feed";