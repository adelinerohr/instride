ALTER TABLE "events" ADD COLUMN "block_scheduling" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "event_scheduling_blocks" DROP COLUMN "block_scheduling";