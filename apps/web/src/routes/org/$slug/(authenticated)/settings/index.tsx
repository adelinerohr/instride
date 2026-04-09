import { createFileRoute, Navigate } from "@tanstack/react-router";

import { isAdmin } from "@/shared/lib/roles";

export const Route = createFileRoute("/org/$slug/(authenticated)/settings/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const canViewAdminSettings = isAdmin(context.membership);

    return {
      isAdmin: canViewAdminSettings,
    };
  },
});

function RouteComponent() {
  const { slug } = Route.useParams();

  return (
    <Navigate to="/org/$slug/settings/account/profile" params={{ slug }} />
  );
}
