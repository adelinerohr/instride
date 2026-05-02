import { kioskOptions } from "@instride/api";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { KioskHeader } from "@/features/kiosk/components/header";
import { ActAsModal } from "@/features/kiosk/components/modals/act-as-modal";
import { PinAuthModal } from "@/features/kiosk/components/modals/pin-auth/modal";
import { RiderSelectModal } from "@/features/kiosk/components/modals/rider-select";
import { KioskProvider } from "@/features/kiosk/hooks/use-kiosk";
import { buildKioskPermissions } from "@/features/kiosk/lib/permissions";
import { ViewLessonSheet } from "@/features/lessons/components/modals/view/sheet";
import { ModalScope } from "@/shared/lib/stores/modal.store";

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

    const permissions = buildKioskPermissions(
      session.acting,
      !!session.acting.actingMemberId
    );

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
      <ModalScope modals={[ViewLessonSheet, PinAuthModal, RiderSelectModal]}>
        <main className="flex h-full min-h-0 flex-col">
          <KioskHeader />
          <div className="min-h-0 flex-1">
            <Outlet />
          </div>
        </main>
      </ModalScope>
      <ActAsModal />
    </KioskProvider>
  );
}
