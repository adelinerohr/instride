import { hasOnlyRole } from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LaptopIcon, ShieldIcon, UserIcon } from "lucide-react";

import { buttonVariants } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute("/org/$slug/(authenticated)/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    // Check roles
    const isRiderOnly = hasOnlyRole(context.member, MembershipRole.RIDER);
    const isGuardianOnly = hasOnlyRole(context.member, MembershipRole.GUARDIAN);

    if (isRiderOnly || isGuardianOnly) {
      throw Route.redirect({ to: "/org/$slug/portal" });
    }

    const isTrainerOnly = hasOnlyRole(context.member, MembershipRole.TRAINER);
    const isAdminOnly = hasOnlyRole(context.member, MembershipRole.ADMIN);

    if (isAdminOnly || isTrainerOnly) {
      throw Route.redirect({ to: "/org/$slug/admin" });
    }
  },
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const { organization } = Route.useRouteContext();

  return (
    <div className="flex min-h-screen flex-col items-center pt-48 bg-background">
      <div className="w-full max-w-sm gap-6 px-4 flex flex-col">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to {organization.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Where would you like to go?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            to="/org/$slug/admin"
            params={{ slug }}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full"
            )}
          >
            <ShieldIcon />
            Admin
          </Link>
          <Link
            to="/org/$slug/portal"
            params={{ slug }}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full"
            )}
          >
            <UserIcon />
            Portal
          </Link>
          <Link
            to="/org/$slug/kiosk"
            params={{ slug }}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full"
            )}
          >
            <LaptopIcon />
            Kiosk
          </Link>
        </div>
      </div>
    </div>
  );
}
