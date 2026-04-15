import { EventModal } from "@/features/calendar/components/modals/event-modal";
import { TimeBlockModal } from "@/features/calendar/components/modals/time-block-form";
import { LessonModal } from "@/features/lessons/components/modals/new-lesson";
import { ViewLessonModal } from "@/features/lessons/components/modals/view-lesson";
import { LevelModal } from "@/features/organization/components/levels/modal";
import { EditRiderModal } from "@/features/organization/components/members/modals/edit-rider";
import { ChangeRoleModal } from "@/features/organization/components/members/modals/role-modal";
import { WaiverModal } from "@/features/organization/components/waivers/waiver-modal";

import { ConfirmationModal } from "./confirmation-modal";

export function Modals() {
  return (
    <>
      <ConfirmationModal />
      <WaiverModal />
      <ChangeRoleModal />
      <EditRiderModal />
      <ViewLessonModal />
      <LevelModal />
      <TimeBlockModal />
      <LessonModal />
      <EventModal />
    </>
  );
}
