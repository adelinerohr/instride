import { Subscription, Topic } from "encore.dev/pubsub";

import { resend } from "./encore.service";

interface EmailEvent {
  to: string;
  subject: string;
  html: string;
}

export const sendEmailTopic = new Topic<EmailEvent>("send-email", {
  deliveryGuarantee: "at-least-once",
});

/**
 * Subscription to send emails via Resend.
 *
 * Example:
 * await sendEmailTopic.publish({
 *   to: "test@exampleemail.com",
 *   subject: "Test Email",
 *   html: "<p>Hello, world!</p>",
 * })
 */
const _ = new Subscription(sendEmailTopic, "send-email-via-resend", {
  handler: async (event) => {
    const { error } = await resend.emails.send({
      from: "Instride <notifications@instride.com>",
      to: event.to,
      subject: event.subject,
      html: event.html,
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  },
});
