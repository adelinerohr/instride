import * as p from "drizzle-orm/pg-core";

import { organizations } from "@/database/schema";

export const quickbooksConnections = p.pgTable("quickbooks_connections", {
  id: p.text("id").primaryKey(),
  organizationId: p
    .text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  realmId: p.text("realm_id").notNull(), // QuickBooks company ID
  accessToken: p.text("access_token").notNull(),
  refreshToken: p.text("refresh_token").notNull(),
  accessTokenExpiresAt: p.timestamp("access_token_expires_at").notNull(),
  refreshTokenExpiresAt: p.timestamp("refresh_token_expires_at").notNull(),
  isActive: p.boolean("is_active").default(true).notNull(),
  createdAt: p.timestamp("created_at").defaultNow().notNull(),
  updatedAt: p.timestamp("updated_at").defaultNow().notNull(),
});

export const quickbooksInvoices = p.pgTable("quickbooks_invoices", {
  id: p.text("id").primaryKey(),
  organizationId: p
    .text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  quickbooksInvoiceId: p.text("quickbooks_invoice_id").notNull(),
  lessonId: p.text("lesson_id"), // optional link to your lessons
  customerId: p.text("customer_id").notNull(), // QuickBooks customer ID
  amount: p.integer("amount").notNull(), // in cents
  status: p.text("status").notNull(), // "pending", "paid", "overdue"
  invoiceUrl: p.text("invoice_url"), // Payment link
  syncedAt: p.timestamp("synced_at").notNull(),
  createdAt: p.timestamp("created_at").defaultNow().notNull(),
});
