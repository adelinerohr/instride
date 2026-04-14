import { IncomingMessage, ServerResponse } from "http";

import { api } from "encore.dev/api";

export const cloverWebhook = api.raw(
  { expose: true, path: "/payments/webhooks/clover", method: "POST" },
  async (req: IncomingMessage, res: ServerResponse) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const body = JSON.parse(Buffer.concat(chunks).toString());

    // Verify the request is from Clover (check their signature header)
    // Then handle event types: PAYMENT_CREATE, REFUND_CREATE, etc.
    console.log("Clover webhook received:", body);

    res.writeHead(200);
    res.end();
  }
);
