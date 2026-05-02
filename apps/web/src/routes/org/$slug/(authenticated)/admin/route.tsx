import { hasAnyRole, hasOnlyRole } from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { ViewLessonSheet } from "@/features/lessons/components/modals/view/sheet";
import { EventModal } from "@/features/organization/components/availability/events/modal";
import { CreateTimeBlockModal } from "@/features/organization/components/availability/time-blocks/modal";
import { AppLayout } from "@/shared/components/layout/app-layout";
import { ModalScope } from "@/shared/lib/stores/modal.store";

type OnlyTrainerContext = {
  isOnlyTrainer: true;
  isOnlyAdmin: false;
  trainerId: string;
};

type OnlyAdminContext = {
  isOnlyAdmin: true;
  isOnlyTrainer: false;
};

type AdminContext = {
  isOnlyAdmin: false;
  isOnlyTrainer: false;
  trainerId: string;
};

export const Route = createFileRoute("/org/$slug/(authenticated)/admin")({
  component: RouteComponent,
  beforeLoad: async ({ context, params }) => {
    const canViewAdmin = hasAnyRole(context.member, [
      MembershipRole.ADMIN,
      MembershipRole.TRAINER,
    ]);

    if (!canViewAdmin) {
      throw redirect({ to: "/org/$slug/portal", params });
    }

    const trainerId = context.member.trainer?.id;
    const isOnlyTrainer = hasOnlyRole(context.member, MembershipRole.TRAINER);

    if (!trainerId) {
      return {
        isOnlyAdmin: true,
        isOnlyTrainer: false,
      } satisfies OnlyAdminContext;
    }

    if (isOnlyTrainer) {
      return {
        trainerId,
        isOnlyTrainer: true,
        isOnlyAdmin: false,
      } satisfies OnlyTrainerContext;
    }

    return {
      trainerId,
      isOnlyTrainer: false,
      isOnlyAdmin: false,
    } satisfies AdminContext;
  },
});

function RouteComponent() {
  return (
    <ModalScope modals={[CreateTimeBlockModal, EventModal, ViewLessonSheet]}>
      <AppLayout type="admin" isAdmin={true}>
        <Outlet />
      </AppLayout>
    </ModalScope>
  );
}
