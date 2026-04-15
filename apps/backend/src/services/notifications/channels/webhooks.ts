import { api } from "encore.dev/api";

interface WebhookRequest {
  data: {
    event_type: string;
    id: string;
    occurred_at: string;
    payload: {
      id: string;
      to: Array<{ phone_number: string; status: string }>;
      from: { phone_number: string };
      text: string;
      completed_at?: string;
      errors?: Array<{ code: number; detail: string; title: string }>;
    };
  };
}

export const handleSMSWebhook = api.raw(
  {
    expose: true,
    path: "/webhooks/sms",
    method: "POST",
  },
  async (req) => {}
);

export const handleSMSWebhookFailover = api.raw(
  {
    expose: true,
    path: "/webhooks/sms/failover",
    method: "POST",
  },
  async (req, res) => {}
);
