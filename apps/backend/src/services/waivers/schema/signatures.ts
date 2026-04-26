import * as p from "drizzle-orm/pg-core";

import { members, organizations } from "@/database/schema";

import { waivers } from "./waivers";

export const waiverSignatures = p.pgTable("waiver_signatures", {
  id: p.uuid("id").primaryKey().defaultRandom(),
  organizationId: p
    .uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  waiverId: p
    .uuid("waiver_id")
    .notNull()
    .references(() => waivers.id),
  waiverVersion: p.text("waiver_version").notNull(),
  signerMemberId: p
    .uuid("signer_member_id")
    .notNull()
    .references(() => members.id),
  onBehalfOfMemberId: p
    .uuid("on_behalf_of_member_id")
    .references(() => members.id), // if guardian signed for a minor
  signedAt: p.timestamp("signed_at").notNull().defaultNow(),
  ipAddress: p.text("ip_address"),
  isValid: p.boolean("is_valid").notNull().default(true),
  invalidatedAt: p.timestamp("invalidated_at"),
  invalidatedReason: p.text("invalidated_reason"),
});

export type WaiverSignatureRow = typeof waiverSignatures.$inferSelect;
export type NewWaiverSignatureRow = typeof waiverSignatures.$inferInsert;
