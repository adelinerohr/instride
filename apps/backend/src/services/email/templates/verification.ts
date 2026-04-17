interface VerificationEmailProps {
  userName?: string;
  verificationUrl: string;
  organizationName?: string;
}

export const verificationEmail = ({
  userName,
  verificationUrl,
  organizationName,
}: VerificationEmailProps): string => {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";
  const title = organizationName
    ? `Welcome to ${organizationName}`
    : "Welcome to Instride";

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
        ${title}
      </h1>
      <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 48px;">
        ${greeting}
      </p>
      <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 48px;">
        Click the button below to verify your email address and complete your registration.
      </p>
      <div style="padding: 27px 0 27px;">
        <a href="${verificationUrl}" style="background-color: #0070f3; border-radius: 5px; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; display: block; width: 200px; padding: 14px 7px; margin: 0 auto;">
          Verify Email
        </a>
      </div>
      <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 48px;">
        Or copy and paste this URL into your browser:
      </p>
      <a href="${verificationUrl}" style="color: #0070f3; font-size: 14px; padding: 0 48px; word-break: break-all;">
        ${verificationUrl}
      </a>
      <p style="color: #8898aa; font-size: 12px; line-height: 16px; padding: 0 48px; margin-top: 32px;">
        If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  </body>
</html>
  `.trim();
};
