import { useCancelLessonInstance, type types } from "@instride/api";
import { MembershipRole } from "@instride/shared";
import { useRouteContext } from "@tanstack/react-router";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHandler,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { hasRole, isOnlyRider } from "@/shared/lib/auth/roles";

import { LessonDetails } from "./lesson-details";
import { PortalActions } from "./portal-actions";
import { RidersList } from "./riders-list";

export const viewLessonModalHandler = DialogHandler.createHandle<{
  lesson: types.LessonInstance;
}>();

export function ViewLessonModal() {
  return (
    <Dialog handle={viewLessonModalHandler}>
      {({ payload }) => (
        <DialogPortal>
          {payload && <ViewLessonModalForm {...payload} />}
        </DialogPortal>
      )}
    </Dialog>
  );
}

interface ViewLessonModalFormProps {
  lesson: types.LessonInstance;
}

export function ViewLessonModalForm({ lesson }: ViewLessonModalFormProps) {
  const { member } = useRouteContext({ from: "/org/$slug/(authenticated)" });
  const isPortal = isOnlyRider(member);
  const cancelLesson = useCancelLessonInstance();

  const lessonName = lesson.name ?? lesson.service?.name ?? "Lesson Details";

  const isAdmin = hasRole(member, MembershipRole.ADMIN);
  const isTrainer = hasRole(member, MembershipRole.TRAINER);
  const isAssignedTrainer = lesson.trainer?.memberId === member.id;
  const hasPassed = new Date(lesson.start) < new Date();

  const canCancel = !hasPassed && (isAdmin || (isTrainer && isAssignedTrainer));

  return (
    <DialogContent className="max-w-lg!">
      <DialogHeader>
        <DialogTitle>{lessonName}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <RidersList instance={lesson} isPortal={isPortal} />
        <LessonDetails instance={lesson} />
      </div>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
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
                  onClick={() =>
                    cancelLesson.mutateAsync({
                      instanceId: lesson.id,
                      request: { reason: "User cancelled" },
                    })
                  }
                  disabled={cancelLesson.isPending}
                >
                  Cancel Lesson
                </Button>
              )}
              <Button variant="default">Edit</Button>
            </>
          )}
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
