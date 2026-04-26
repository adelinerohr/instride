import { kioskOptions } from "@instride/api";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ActAsModal } from "@/features/kiosk/components/act-as-modal";
import { KioskHeader } from "@/features/kiosk/components/header";
import { KioskProvider } from "@/features/kiosk/hooks/use-kiosk";
import { buildKioskPermissions } from "@/features/kiosk/lib/permissions";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/kiosk/$sessionId"
)({
  component: RouteComponent,
  beforeLoad: async ({ context, params }) => {
    const session = await context.queryClient.ensureQueryData(
      kioskOptions.session(params.sessionId)
    );

    if (!session) {
      throw Route.redirect({ to: "/org/$slug/kiosk", replace: true });
    }

    const permissions = buildKioskPermissions(session.acting);

    return {
      kioskSession: session.session,
      kioskPermissions: permissions,
    };
  },
  onError: () => {
    Route.redirect({ to: "/org/$slug/kiosk", replace: true });
  },
});

function RouteComponent() {
  const { sessionId } = Route.useParams();

  return (
    <KioskProvider sessionId={sessionId}>
      <main className="flex h-full min-h-0 flex-col">
        <KioskHeader />
        <div className="min-h-0 flex-1">
          <Outlet />
        </div>
      </main>
      <ActAsModal />
    </KioskProvider>
  );
}
