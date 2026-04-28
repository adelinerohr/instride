CREATE TYPE "notification_delivery_status" AS ENUM('pending', 'sent', 'delivered', 'failed');--> statement-breakpoint
CREATE TYPE "notification_entity_type" AS ENUM('lesson', 'post', 'payment', 'conversation', 'message', 'system', 'other');--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'chat_message_received';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'chat_lesson_invited';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'chat_lesson_proposed';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'chat_lesson_accepted';--> statement-breakpoint
ALTER TYPE "notification_type" ADD VALUE 'chat_lesson_declined';--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "source_event_id" text;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ALTER COLUMN "status" SET DATA TYPE "notification_delivery_status" USING "status"::"notification_delivery_status";--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "entity_type" SET DATA TYPE "notification_entity_type" USING "entity_type"::"notification_entity_type";--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_event_idempotency_key" UNIQUE("recipient_id","source_event_id");