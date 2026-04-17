interface InvitationEmailProps {
  invitedByName: string;
  organizationName: string;
  invitationUrl: string;
  isExistingUser: boolean;
}

export const invitationEmail = ({
  invitedByName,
  organizationName,
  invitationUrl,
  isExistingUser,
}: InvitationEmailProps): string => {
  const buttonText = isExistingUser ? "Accept Invitation" : "Create Account";
  const instructions = isExistingUser
    ? "Click the button below to accept the invitation."
    : "Click the button below to create your account and join.";

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
        You're Invited!
      </h1>
      <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 48px;">
        ${invitedByName} has invited you to join <strong>${organizationName}</strong> on Instride.
      </p>
      <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 48px;">
        ${instructions}
      </p>
      <div style="padding: 27px 0 27px;">
        <a href="${invitationUrl}" style="background-color: #0070f3; border-radius: 5px; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; display: block; width: 200px; padding: 14px 7px; margin: 0 auto;">
          ${buttonText}
        </a>
      </div>
      <p style="color: #333; font-size: 16px; line-height: 26px; padding: 0 48px;">
        Or copy and paste this URL into your browser:
      </p>
      <a href="${invitationUrl}" style="color: #0070f3; font-size: 14px; padding: 0 48px; word-break: break-all;">
        ${invitationUrl}
      </a>
      <p style="color: #8898aa; font-size: 12px; line-height: 16px; padding: 0 48px; margin-top: 32px;">
        This invitation will expire in 7 days.
      </p>
    </div>
  </body>
</html>
  `.trim();
};
