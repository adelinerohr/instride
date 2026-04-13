import { useQuery } from "@tanstack/react-query";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { authClient } from "@/shared/lib/auth/client";
import {
  oAuthProviders,
  type OAuthProvider,
} from "@/shared/lib/auth/oauth-providers";

export function ConnectedAccounts() {
  const { data: connectedAccounts, isPending } = useQuery({
    queryKey: ["auth", "accounts"],
    queryFn: async () => {
      const { data, error } = await authClient.listAccounts();
      if (error) throw error;
      return data;
    },
  });

  if (isPending) return <Skeleton className="w-full h-10" />;

  const isProviderLinked = (provider: OAuthProvider) =>
    connectedAccounts?.some((account) => account.providerId === provider);

  const connect = (provider: OAuthProvider) => {
    const callbackURL = window.location.href;
    if (!isProviderLinked(provider)) {
      authClient.linkSocial({
        provider,
        callbackURL,
      });
    }
  };

  const disconnect = (provider: OAuthProvider) => {
    if (isProviderLinked(provider)) {
      authClient.unlinkAccount({
        providerId: provider,
      });
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(oAuthProviders).map(([provider, providerData]) => {
            const isLinked = isProviderLinked(provider as OAuthProvider);
            return (
              <div
                key={provider}
                className="flex items-center justify-between gap-3 rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <providerData.icon className="size-5 text-primary/50" />
                  <span className="font-medium text-sm">
                    {providerData.name}
                  </span>
                </div>
                {isPending ? (
                  <Skeleton className="h-10 w-28" />
                ) : (
                  <Button
                    variant="outline"
                    disabled={
                      isLinked && (connectedAccounts?.length || 0) === 1
                    }
                    onClick={() =>
                      isLinked
                        ? disconnect(provider as OAuthProvider)
                        : connect(provider as OAuthProvider)
                    }
                  >
                    {isLinked ? "Disconnect" : "Connect"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
