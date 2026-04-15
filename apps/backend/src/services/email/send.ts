import { api } from "encore.dev/api";

import { sendEmailTopic } from "./topic";

interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
}

interface SendEmailResponse {
  message: string;
}

export const sendEmail = api(
  {
    expose: true,
    method: "POST",
    path: "/email/send",
  },
  async (request: SendEmailRequest): Promise<SendEmailResponse> => {
    await sendEmailTopic.publish({
      to: request.to,
      subject: request.subject,
      html: request.html,
    });

    return { message: `Email queued for ${request.to}` };
  }
);
