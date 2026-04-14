import { secret } from "encore.dev/config";

const BASE = "https://apisandbox.dev.clover.com"; // production; use https://scl.clover.com for sandbox

export const cloverApiToken = secret("CloverApiToken");
export const cloverMerchantId = secret("CloverMerchantId");

interface CloverCharge {
  id: string;
  status: string;
  amount: number;
  currency: string;
}

interface CloverRefund {
  id: string;
  object: "refund";
  amount: number; // in cents
  charge: string; // the original charge id
  currency: string;
  status: "succeeded" | "failed" | "pending";
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
  created?: number; // unix timestamp
}

export async function createCharge(params: {
  /* amount in cents */
  amount: number;
  /* tokenized card from Clover.js iframe */
  source: string;
  currency?: string;
}): Promise<CloverCharge> {
  const res = await fetch(`${BASE}/v1/charges`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cloverApiToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency ?? "usd",
      source: params.source,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    if (err instanceof Error) {
      throw new Error(`Failed to create charge: ${err.message}`);
    } else {
      throw new Error("Failed to create charge");
    }
  }

  return res.json() as Promise<CloverCharge>;
}

export async function refundCharge(
  chargeId: string,
  amount?: number
): Promise<CloverRefund> {
  const res = await fetch(`${BASE}/v1/charges/${chargeId}/refunds`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cloverApiToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(amount ? { amount } : {}),
  });

  if (!res.ok) throw new Error("Clover refund failed");
  return res.json() as Promise<CloverRefund>;
}
