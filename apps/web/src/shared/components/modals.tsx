import { LessonModal } from "@/features/lessons/components/modals/new-lesson";
import { GuardianInvitationModal } from "@/features/onboarding/components/modals/guardian-invitation";
import { LevelModal } from "@/features/organization/components/levels/modal";
import { EditRiderModal } from "@/features/organization/components/members/modals/edit-rider";
import { ChangeRoleModal } from "@/features/organization/components/members/modals/role-modal";
import { WaiverModal } from "@/features/organization/components/waivers/waiver-modal";

export function Modals() {
  return (
    <>
      <WaiverModal />
      <ChangeRoleModal />
      <EditRiderModal />
      <LevelModal />
      <LessonModal />
      <GuardianInvitationModal />
    </>
  );
}
