import { kioskOptions } from "@instride/api";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ActAsModal } from "@/features/kiosk/components/act-as-modal";
import { ActingBanner } from "@/features/kiosk/components/acting-banner";
import { KioskProvider } from "@/features/kiosk/hooks/use-kiosk";

export const Route = createFileRoute(
  "/org/$slug/(authenticated)/kiosk/$sessionId"
)({
  component: RouteComponent,
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(kioskOptions.session(params.sessionId));
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
        <ActingBanner />
        <div className="min-h-0 flex-1">
          <Outlet />
        </div>
      </main>
      <ActAsModal />
    </KioskProvider>
  );
}
