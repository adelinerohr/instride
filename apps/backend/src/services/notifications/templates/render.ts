import { render } from "react-email";

import { APP_NAME } from "@/shared/constants";

import { NotificationRow } from "../schema";
import GenericNotificationEmail from "./generic-notification";

interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/**
 * Returns the rendered email for a notification, or null if this
 * notification type doesn't ship an email (e.g., low-signal events).
 */
export async function renderNotificationEmail(input: {
  notification: NotificationRow;
  recipientName: string;
}): Promise<RenderedEmail | null> {
  const element = GenericNotificationEmail({
    appName: APP_NAME,
    recipientName: input.recipientName,
    title: input.notification.title,
    body: input.notification.message,
    cta: input.notification.deepLink
      ? {
          label: "Open in Instride",
          href: input.notification.deepLink,
        }
      : null,
  });

  return {
    subject: input.notification.title,
    html: await render(element),
    text: await render(element, { plainText: true }),
  };
}
