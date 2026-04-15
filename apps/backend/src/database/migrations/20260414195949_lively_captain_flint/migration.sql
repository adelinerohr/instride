ALTER TABLE "kiosk_acting_tokens" ADD COLUMN "board_id" uuid;--> statement-breakpoint
ALTER TABLE "kiosk_acting_tokens" ADD COLUMN "location_name" text;--> statement-breakpoint
CREATE INDEX "kioskActingTokens_organizationId_idx" ON "kiosk_acting_tokens" ("organization_id");--> statement-breakpoint
CREATE INDEX "kioskActingTokens_expiresAt_idx" ON "kiosk_acting_tokens" ("expires_at");--> statement-breakpoint
CREATE INDEX "kioskActingTokens_actingMemberId_idx" ON "kiosk_acting_tokens" ("acting_for_member_id");--> statement-breakpoint
ALTER TABLE "kiosk_acting_tokens" ADD CONSTRAINT "kiosk_acting_tokens_board_id_boards_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE SET NULL;