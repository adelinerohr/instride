import { appMeta } from "encore.dev";
import log from "encore.dev/log";
import { Subscription, Topic } from "encore.dev/pubsub";

import { resend } from "./encore.service";

interface EmailEvent {
  from?: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
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
    const environment = appMeta().environment;

    if (environment.type === "development") {
      log.info("Sent email to development environment", {
        to: event.to,
        subject: event.subject,
        text: event.text,
      });
    } else {
      const { error } = await resend.emails.send({
        from: event.from ?? "Instride <info@notifications.instrideapp.com>",
        to: event.to,
        subject: event.subject,
        html: event.html,
        text: event.text,
      });

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }
    }
  },
});
