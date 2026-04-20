import { api, APIError } from "encore.dev/api";

import { requireOrganizationAuth } from "@/shared/auth";

import { refreshAccessToken } from "./auth";
import { db } from "./db";
import { quickbooksInvoices } from "./schema";
import {
  QuickBooksInvoicePayload,
  QuickBooksInvoiceResponse,
} from "./types/models";
import { isQuickBooksError } from "./utils";

interface CreateQuickBooksInvoiceRequest {
  customerId: string;
  amount: number;
  lineItems: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
  lessonId?: string;
}

interface CreateQuickBooksInvoiceResponse {
  id: string;
  quickbooksId: string;
  invoiceUrl?: string;
  status: string;
}

export const createQuickBooksInvoice = api(
  { expose: true, method: "POST", path: "/quickbooks/invoices" },
  async (
    request: CreateQuickBooksInvoiceRequest
  ): Promise<CreateQuickBooksInvoiceResponse> => {
    const { organizationId } = requireOrganizationAuth();

    const connection = await db.query.quickbooksConnections.findFirst({
      where: {
        organizationId,
        isActive: true,
      },
    });

    if (!connection) {
      throw APIError.notFound("QuickBooks not connected for this organization");
    }

    const accessToken = await refreshAccessToken();

    const baseUrl =
      process.env.QUICKBOOKS_ENVIRONMENT === "sandbox"
        ? "https://sandbox-quickbooks.api.intuit.com"
        : "https://quickbooks.api.intuit.com";

    const invoicePayload: QuickBooksInvoicePayload = {
      Line: request.lineItems.map((item) => ({
        Amount: item.amount / 100, // Convert cents to dollars
        DetailType: "SalesItemLineDetail",
        Description: item.description,
        SalesItemLineDetail: {
          Qty: item.quantity || 1,
          UnitPrice: item.amount / 100 / (item.quantity || 1),
        },
      })),
      CustomerRef: {
        value: request.customerId,
      },
      BillEmail: {
        Address: "", // You'll want to pass this from your customer data
      },
      AllowOnlineACHPayment: true,
      AllowOnlineCreditCardPayment: true,
    };

    const response = await fetch(
      `${baseUrl}/v3/company/${connection.realmId}/invoice?minorversion=65&include=invoiceLink`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(invoicePayload),
      }
    );

    const data: unknown = await response.json();

    if (!response.ok || isQuickBooksError(data)) {
      const errorMsg = isQuickBooksError(data)
        ? data.Fault.Error.map((e) => e.Message).join(", ")
        : "Unknown error";
      throw APIError.unavailable(
        `Failed to create QuickBooks invoice: ${errorMsg}`
      );
    }

    const invoiceResponse = data as QuickBooksInvoiceResponse;
    const invoice = invoiceResponse.Invoice;

    // Store in your database
    const invoiceRecord = {
      id: `inv_${Date.now()}`,
      organizationId,
      quickbooksInvoiceId: invoice.Id,
      lessonId: request.lessonId,
      customerId: request.customerId,
      amount: request.amount,
      status: "pending" as const,
      invoiceUrl: invoice.InvoiceLink || null,
      syncedAt: new Date(),
      createdAt: new Date(),
    };

    await db.insert(quickbooksInvoices).values(invoiceRecord);

    return {
      id: invoiceRecord.id,
      quickbooksId: invoice.Id,
      invoiceUrl: invoice.InvoiceLink,
      status: "pending" as const,
    };
  }
);
