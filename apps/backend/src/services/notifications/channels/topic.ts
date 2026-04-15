import { Subscription, Topic } from "encore.dev/pubsub";

import { sendSMS } from "./sms";

interface SMSEvent {
  to: string;
  message: string;
}

export const sendSMSTopic = new Topic<SMSEvent>("send-sms", {
  deliveryGuarantee: "at-least-once",
});

const _ = new Subscription(sendSMSTopic, "send-sms", {
  handler: async (event) => {
    await sendSMS({
      to: event.to,
      message: event.message,
    });
  },
});
