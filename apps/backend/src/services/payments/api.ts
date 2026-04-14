import { api, APIError } from "encore.dev/api";

import { createCharge, refundCharge } from "./clover";

interface ChargeRequest {
  amountCents: number;
  cardToken: string;
  lessonId: string;
}

interface ChargeResponse {
  chargeId: string;
  status: string;
}

export const charge = api(
  {
    expose: true,
    method: "POST",
    path: "/payments/charge",
    auth: true,
  },
  async (req: ChargeRequest): Promise<ChargeResponse> => {
    try {
      const result = await createCharge({
        amount: req.amountCents,
        source: req.cardToken,
      });
      return {
        chargeId: result.id,
        status: result.status,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw APIError.internal("Payment failed").withDetails(error);
      } else {
        throw APIError.internal("Payment failed");
      }
    }
  }
);

export const refund = api(
  { expose: true, method: "POST", path: "/payments/refund", auth: true },
  async (req: {
    chargeId: string;
    amountCents?: number;
  }): Promise<{ status: string }> => {
    const result = await refundCharge(req.chargeId, req.amountCents);
    return { status: result.status };
  }
);
