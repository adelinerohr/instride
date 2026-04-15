import { appMeta } from "encore.dev";
import { secret } from "encore.dev/config";
import { Telnyx } from "telnyx";

const telnyxApiKey = secret("TelnyxApiKey");
const telnyxPhoneNumber = secret("TelnyxPhoneNumber");

const telnyx = new Telnyx({
  apiKey: telnyxApiKey(),
});

const isDevelopment = appMeta().environment.type === "development";

export async function sendSMS(input: {
  to: string;
  message: string;
}): Promise<string> {
  // Development mode: log the message
  if (isDevelopment) {
    console.log("─────────────────────────────────────");
    console.log("📱 SMS");
    console.log(`To: ${input.to}`);
    console.log(`Message: ${input.message}`);
    console.log(`Length: ${input.message.length}`);
    console.log("─────────────────────────────────────");
    return `mock-sms-${Date.now()}`;
  }

  try {
    // Validate phone number format
    if (!input.to.startsWith("+")) {
      throw new Error(
        "Phone number must be in E.164 format (e.g., +14155552671)"
      );
    }

    // Truncate message if too long (160 chars for single SMS)
    const text =
      input.message.length > 160
        ? input.message.substring(0, 157) + "..."
        : input.message;

    // Send via Telnyx
    const response = await telnyx.messages.send({
      from: telnyxPhoneNumber(),
      to: input.to,
      text,
      // Optional: webhook for delivery status
      webhook_url: `${appMeta().apiBaseUrl}/webhooks/sms`,
      webhook_failover_url: `${appMeta().apiBaseUrl}/webhooks/sms/failover`,
    });

    if (!response.data?.id) {
      throw new Error("Failed to send SMS: No response from Telnyx");
    }

    console.log("✅ SMS sent via Telnyx:", response.data.id);
    return response.data.id;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
}

export async function sendBatch(messages: { to: string; message: string }[]) {
  if (isDevelopment || !telnyx) {
    console.log("─────────────────────────────────────");
    console.log(`📱 [SMS Mock Batch] ${messages.length} messages`);
    console.log(`To: ${messages.map((msg) => msg.to).join(", ")}`);
    console.log("─────────────────────────────────────");
    return messages.map((msg, i) => ({
      to: msg.to,
      success: true,
      messageId: `mock-sms-${Date.now()}-${i}`,
      error: null,
    }));
  }

  const results = await Promise.allSettled(messages.map((msg) => sendSMS(msg)));

  return results.map((result, index) => ({
    to: messages[index].to,
    success: result.status === "fulfilled",
    messageId: result.status === "fulfilled" ? result.value : null,
    error:
      result.status === "rejected"
        ? result.reason instanceof Error
          ? result.reason.message
          : String(result.reason)
        : null,
  }));
}

export async function getDeliveryStatus(messageId: string) {
  if (isDevelopment || !telnyx) {
    return { status: "mock-delivered" };
  }

  try {
    const message = await telnyx.messages.retrieve(messageId);

    if (!message.data) {
      throw new Error("Failed to fetch SMS status: No response from Telnyx");
    }

    return {
      status: message.data.to?.[0]?.status,
      // Status values: queued, sending, sent, delivered, sending_failed, delivery_failed
      errorCode: message.data.errors?.[0]?.code,
      errorMessage: message.data.errors?.[0]?.detail,
      completedAt: message.data.completed_at,
    };
  } catch (error) {
    console.error("Failed to fetch SMS status:", error);
    return null;
  }
}
