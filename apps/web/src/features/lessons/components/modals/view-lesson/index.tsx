import { useCancelLessonInstance, type types } from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";

import { confirmationModalHandler } from "@/shared/components/confirmation-modal";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHandler,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { hasRole } from "@/shared/lib/auth/roles";

import { lessonModalHandler } from "../new-lesson";
import { LessonDetails } from "./lesson-details";
import { PortalActions } from "./portal-actions";
import { RidersList } from "./riders-list";

export const viewLessonModalHandler = SheetHandler.createHandle<{
  lesson: types.LessonInstance;
}>();

export function ViewLessonModal() {
  return (
    <Sheet handle={viewLessonModalHandler}>
      {({ payload }) => payload && <ViewLessonModalForm {...payload} />}
    </Sheet>
  );
}

interface ViewLessonModalFormProps {
  lesson: types.LessonInstance;
}

export function ViewLessonModalForm({ lesson }: ViewLessonModalFormProps) {
  const { member, isPortal } = useRouteContext({
    from: "/org/$slug/(authenticated)",
  });

  const cancelLesson = useCancelLessonInstance();

  const lessonName = lesson.name
    ? `${lesson.name} - ${lesson.service?.name}`
    : (lesson.service?.name ?? "Lesson Details");

  const isAdmin = hasRole(member, MembershipRole.ADMIN);
  const isTrainer = hasRole(member, MembershipRole.TRAINER);
  const isAssignedTrainer = lesson.trainer?.memberId === member.id;
  const hasPassed = new Date(lesson.start) < new Date();

  const canCancel = !hasPassed && (isAdmin || (isTrainer && isAssignedTrainer));

  const handleEdit = () => {
    viewLessonModalHandler.close();
    lessonModalHandler.openWithPayload({ lesson });
  };

  const handleCancel = () => {
    confirmationModalHandler.openWithPayload({
      title: "Cancel Lesson?",
      description:
        "Are you sure you want to cancel this lesson? This action cannot be undone. All enrolled riders will be removed.",
      confirmLabel: "Cancel Lesson",
      cancelLabel: "Cancel",
      onConfirm: () => {
        cancelLesson.mutateAsync(
          {
            instanceId: lesson.id,
            request: { reason: "User cancelled" },
          },
          {
            onSuccess: () => {
              toast.success("Lesson cancelled successfully");
              viewLessonModalHandler.close();
            },
            onError: () => {
              toast.error("Failed to cancel lesson");
            },
          }
        );
      },
    });
  };

  return (
    <SheetContent className="max-w-lg!">
      <SheetHeader>
        <SheetTitle>{lessonName}</SheetTitle>
        <SheetDescription>View lesson details</SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-4 px-4">
        <RidersList instance={lesson} isPortal={isPortal} />
        <LessonDetails instance={lesson} />
      </div>
      <SheetFooter className="flex flex-row w-full gap-2 items-center justify-between">
        <SheetClose render={<Button variant="outline" />}>Close</SheetClose>
        <div className="flex items-center gap-2">
          {isPortal ? (
            <PortalActions
              instance={lesson}
              onClose={viewLessonModalHandler.close}
            />
          ) : (
            <>
              {canCancel && (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelLesson.isPending}
                >
                  Cancel Lesson
                </Button>
              )}
              <Button variant="default" type="button" onClick={handleEdit}>
                Edit
              </Button>
            </>
          )}
        </div>
      </SheetFooter>
    </SheetContent>
  );
}
