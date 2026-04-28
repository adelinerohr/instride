import type * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";

export type GenericNotificationEmailProps = {
  /** Product name shown in the header — e.g., "Instride". */
  appName: string;
  /** Recipient's display name. Falls back to "there" if unknown. */
  recipientName?: string | null;
  /**
   * The notification's headline. Mirrors the in-app notification title
   * and is also used as the email subject by the caller.
   */
  title: string;
  /** Body copy. Plain text — paragraphs split on \n\n. */
  body: string;
  /** Optional call-to-action button. Both label and href are required if present. */
  cta?: {
    label: string;
    href: string;
  } | null;
  /**
   * Footer hint — short context about why this email was sent.
   * Defaults to a generic notice when omitted.
   */
  footerHint?: string;
};

function GenericNotificationEmail({
  appName,
  recipientName,
  title,
  body,
  cta,
  footerHint,
}: GenericNotificationEmailProps): React.JSX.Element {
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi there,";

  // Split the body on blank lines into paragraphs. Keeps templates readable
  // while letting callers pass multi-paragraph content via "\n\n".
  const paragraphs = body.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Tailwind>
        <Body className="m-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-sm border border-[#eaeaea] border-solid p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black">
              {title}
            </Heading>

            <Text className="text-[14px] text-black leading-[24px]">
              {greeting}
            </Text>

            {paragraphs.map((paragraph, index) => (
              <Text
                key={index}
                className="text-[14px] text-black leading-[24px]"
              >
                {paragraph}
              </Text>
            ))}

            {cta && (
              <>
                <Section className="my-[32px] text-center">
                  <Button
                    href={cta.href}
                    className="rounded-sm bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
                  >
                    {cta.label}
                  </Button>
                </Section>
                <Text className="text-[14px] text-black leading-[24px]">
                  or copy and paste this URL into your browser:{" "}
                  <Link
                    href={cta.href}
                    className="break-all text-blue-600 no-underline"
                  >
                    {cta.href}
                  </Link>
                </Text>
              </>
            )}

            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />

            <Text className="text-[#666666] text-[12px] leading-[24px]">
              {footerHint ??
                `You're receiving this email because you have notifications enabled for ${appName}. You can manage your preferences in your account settings.`}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

GenericNotificationEmail.PreviewProps = {
  appName: "Instride",
  recipientName: "Lily",
  title: "Lesson invitation",
  body: "Sarah Mitchell invited you to a lesson.\n\nDressage Basics on Thu, Apr 24 at 2:00 PM with Sarah Mitchell at Maple · Indoor Arena.",
  cta: {
    label: "Open in Instride",
    href: "https://app.instrideapp.com/messages/abc-123",
  },
} satisfies GenericNotificationEmailProps;

export default GenericNotificationEmail;
export { GenericNotificationEmail };
