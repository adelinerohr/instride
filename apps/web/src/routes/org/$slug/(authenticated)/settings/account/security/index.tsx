import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import {
  AnnotatedLayout,
  AnnotatedSection,
} from "@/shared/components/layout/annotated";
import { Separator } from "@/shared/components/ui/separator";
import { authClient } from "@/shared/lib/auth/client";

import { ChangePassword } from "./-change-password";
import { ConnectedAccounts } from "./-connected-accounts";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/settings/account/security/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: connectedAccounts, isPending } = useQuery({
    queryKey: ["auth", "accounts"],
    queryFn: async () => {
      const { data, error } = await authClient.listAccounts();
      if (error) throw error;
      return data;
    },
  });

  const userHasPassword =
    !isPending &&
    connectedAccounts?.some((account) => account.providerId === "credential");

  return (
    <AnnotatedLayout>
      {userHasPassword && (
        <>
          <AnnotatedSection
            title="Change password"
            description="To make an update, enter your existing password followed by a new one. If you don't know your existing password, sign out and use the forgot password link."
          >
            <ChangePassword />
          </AnnotatedSection>
          <Separator />
        </>
      )}
      <AnnotatedSection
        title="Connected accounts"
        description="Sign up faster to your account by linking it to Google or Microsoft."
      >
        <ConnectedAccounts />
      </AnnotatedSection>
    </AnnotatedLayout>
  );
}
