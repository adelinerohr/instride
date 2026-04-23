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
  Text,
  Tailwind,
} from "react-email";

export type DependentInvitationEmailProps = {
  appName: string;
  guardianName: string;
  guardianEmail: string;
  dependentName: string;
  organizationName: string;
  inviteLink: string;
};

function DependentInvitationEmail({
  appName,
  guardianName,
  guardianEmail,
  dependentName,
  organizationName,
  inviteLink,
}: DependentInvitationEmailProps): React.JSX.Element {
  return (
    <Html>
      <Head />
      <Preview>
        {guardianName} invited you to join {organizationName} on {appName}
      </Preview>
      <Tailwind>
        <Body className="m-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded-sm border border-[#eaeaea] border-solid p-[20px]">
            <Heading className="mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black">
              Join <strong>{organizationName}</strong> on{" "}
              <strong>{appName}</strong>
            </Heading>
            <Text className="text-[14px] text-black leading-[24px]">
              Hi {dependentName},
            </Text>
            <Text className="text-[14px] text-black leading-[24px]">
              <strong>{guardianName}</strong> (
              <Link
                href={`mailto:${guardianEmail}`}
                className="break-all text-blue-600 no-underline"
              >
                {guardianEmail}
              </Link>
              ) has invited you to join <strong>{organizationName}</strong> on{" "}
              <strong>{appName}</strong> and linked your account to theirs as
              your guardian.
            </Text>
            <Text className="text-[14px] text-black leading-[24px]">
              Accept the invitation to set up your account and start managing
              your lessons, schedule, and activity.
            </Text>
            <Section className="my-[32px] text-center">
              <Button
                href={inviteLink}
                className="rounded-sm bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
              >
                Accept invitation
              </Button>
            </Section>
            <Text className="text-[14px] text-black leading-[24px]">
              or copy and paste this URL into your browser:{" "}
              <Link
                href={inviteLink}
                className="break-all text-blue-600 no-underline"
              >
                {inviteLink}
              </Link>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you don't recognize {guardianName} or weren't expecting this
              invitation, you can safely ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

DependentInvitationEmail.PreviewProps = {
  appName: "Instride",
  guardianName: "Jane Doe",
  guardianEmail: "jane.doe@gmail.com",
  dependentName: "Alex",
  organizationName: "Red Coat Farm",
  inviteLink:
    "https://example.com/invitations/request/a5cffa7e-76eb-4671-a195-d1670a7d4df3",
} satisfies DependentInvitationEmailProps;

export default DependentInvitationEmail;
export { DependentInvitationEmail };
