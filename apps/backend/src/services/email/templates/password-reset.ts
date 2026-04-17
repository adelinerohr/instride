interface PasswordResetEmailProps {
  userName?: string;
  resetUrl: string;
  organizationName?: string;
}

export const passwordResetEmail = ({
  userName,
  resetUrl,
  organizationName,
}: PasswordResetEmailProps): string => {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";
  const context = organizationName ? ` for ${organizationName}` : "";

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;">
    <div style="background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; margin-bottom: 64px; max-width: 600px;">
      <h1 style="color: #333; font-size: 24px; font-weight: bold; margin: 40px 0; padding: 0 48px;">
        Password Reset Request
      </h1>
      <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 48px;">
        ${greeting}
      </p>
      <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 48px;">
        We received a request to reset your password${context}. Click the button below to create a new password.
      </p>
      <div style="padding: 27px 0 27px;">
        <a href="${resetUrl}" style="background-color: #0070f3; border-radius: 5px; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; display: block; width: 200px; padding: 14px 7px; margin: 0 auto;">
          Reset Password
        </a>
      </div>
      <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 48px;">
        Or copy and paste this URL into your browser:
      </p>
      <a href="${resetUrl}" style="color: #0070f3; font-size: 14px; padding: 0 48px; word-break: break-all;">
        ${resetUrl}
      </a>
      <p style="color: #8898aa; font-size: 12px; line-height: 16px; padding: 0 48px; margin-top: 32px;">
        This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  </body>
</html>
  `.trim();
};
