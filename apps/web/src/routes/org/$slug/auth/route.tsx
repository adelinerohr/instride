import { organizationOptions } from "@instride/api";
import {
  createFileRoute,
  notFound,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { OrganizationLogo } from "@/shared/components/fragments/org-logo";

export const Route = createFileRoute("/org/$slug/auth")({
  component: RouteComponent,
  beforeLoad: async ({ context, params }) => {
    if (context.isAuthenticated) {
      throw redirect({
        to: "/org/$slug",
        params,
      });
    }

    try {
      const organization = await context.queryClient.ensureQueryData(
        organizationOptions.bySlug(params.slug)
      );

      if (!organization) {
        throw notFound();
      }

      return { organization };
    } catch {
      throw notFound();
    }
  },
});

function RouteComponent() {
  const { organization } = Route.useRouteContext();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center flex-col justify-center gap-2 self-center font-medium">
          <OrganizationLogo organization={organization} size="xl" />
          <h1 className="text-2xl font-display font-semibold tracking-tight">
            {organization.name}
          </h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
