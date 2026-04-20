import { describe, expect, test } from "vitest";

import { sendEmail } from "./send";

const TEST_EMAIL_FROM = "Acme <onboarding@resend.dev>";
const TEST_EMAIL_TO = "delivered@resend.dev";

describe("send email", () => {
  test("it should send an email", async () => {
    const response = await sendEmail({
      from: TEST_EMAIL_FROM,
      to: TEST_EMAIL_TO,
      subject: "Test Email",
      html: "<p>Hello, world!</p>",
    });
    expect(response.message).toBe("Email queued for delivered@resend.dev");
  });
});
