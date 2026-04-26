import { organizationOptions, useSignOut } from "@instride/api";
import { ROLE_VARIANTS } from "@instride/shared";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  BuildingIcon,
  ChevronRightIcon,
  ShieldIcon,
  UserPlusIcon,
} from "lucide-react";

import { OrganizationLogo } from "@/shared/components/fragments/org-logo";
import { brand } from "@/shared/components/logo";
import { Badge } from "@/shared/components/ui/badge";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { FieldSeparator } from "@/shared/components/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/shared/components/ui/item";
import { cn } from "@/shared/lib/utils";

/**
 * Path: /
 *
 * Description: Non-org user landing page, redirects based on auth state
 */

export const Route = createFileRoute("/(authenticated)/")({
  component: HomeComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      organizationOptions.listByUser(context.user.id)
    );
  },
});

function HomeComponent() {
  const { user } = Route.useRouteContext();
  const navigate = Route.useNavigate();
  const router = useRouter();

  const { data: organizations } = useSuspenseQuery(
    organizationOptions.listByUser(user.id)
  );

  const signOut = useSignOut({
    mutationConfig: {
      onSuccess: async () => {
        await router.invalidate();
        navigate({
          to: "/auth/login",
        });
      },
    },
  });

  const isSuperAdmin = user.role?.includes("admin") || false;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background relative">
      <Button
        variant="ghost"
        className="absolute top-4 left-4"
        onClick={() => signOut.mutate({})}
      >
        Sign out
      </Button>
      {isSuperAdmin && (
        <Link
          to="/admin"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute top-4 right-4"
          )}
        >
          <ShieldIcon />
          Admin
        </Link>
      )}
      <div className="w-full max-w-lg gap-6 px-4 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2">
          {brand.mark({ className: "size-12" })}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-display font-semibold tracking-tight">
              Welcome to Instride
            </h1>
            <p className="text-sm text-muted-foreground">
              What would you like to do?
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {organizations.map(({ organization, roles }) => (
            <Item
              variant="outline"
              className="bg-card"
              key={organization.id}
              render={
                <Link to="/org/$slug" params={{ slug: organization.slug }} />
              }
            >
              <ItemMedia>
                <OrganizationLogo size="lg" organization={organization} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{organization.name}</ItemTitle>
                <ItemDescription className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <Badge key={role} variant={ROLE_VARIANTS[role]}>
                      {role}
                    </Badge>
                  ))}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="ghost" size="icon">
                  <ChevronRightIcon />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </div>

        {organizations.length > 0 && <FieldSeparator>or</FieldSeparator>}

        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/create-organization"
            className="hover:bg-muted bg-card border text-center rounded-lg p-6 flex flex-col items-center justify-center gap-2"
          >
            <BuildingIcon className="text-muted-foreground" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold">Create organization</span>
              <span className="text-xs text-muted-foreground">
                I would like to create a new organization.
              </span>
            </div>
          </Link>
          <Link
            to="/join-organization"
            className="hover:bg-muted bg-card border text-center rounded-lg p-6 flex flex-col items-center justify-center gap-2"
          >
            <UserPlusIcon className="text-muted-foreground" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-semibold">Join organization</span>
              <span className="text-xs text-muted-foreground">
                I would like to join an existing organization.
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
