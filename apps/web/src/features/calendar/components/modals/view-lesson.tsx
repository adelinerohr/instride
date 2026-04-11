import { type types } from "@instride/api";
import { format } from "date-fns";
import {
  CalendarDaysIcon,
  Clock3Icon,
  FileTextIcon,
  UserIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHandler,
  DialogPortal,
  DialogTitle,
} from "@/shared/components/ui/dialog";

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
  const enrollments = lesson.enrollments || [];

  return (
    <DialogContent className="max-w-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <DialogTitle className="text-base font-semibold">
            {lesson.name?.trim() || "Lesson Details"}
          </DialogTitle>

          <p className="mt-1 text-sm text-muted-foreground">
            View lesson information and enrollment details
          </p>
        </div>

        <DialogClose className="shrink-0" />
      </div>
      <div className="mt-5 space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow
            icon={CalendarDaysIcon}
            label="Date"
            value={format(new Date(lesson.start), "EEEE, MMMM d, yyyy")}
          />

          <InfoRow
            icon={Clock3Icon}
            label="Time"
            value={`${format(new Date(lesson.start), "h:mm a")} – ${format(
              new Date(lesson.end),
              "h:mm a"
            )}`}
          />

          {"trainerName" in lesson && lesson.trainerName ? (
            <InfoRow
              icon={UserIcon}
              label="Trainer"
              value={String(lesson.trainerName)}
            />
          ) : null}

          {"maxRiders" in lesson ? (
            <InfoRow
              icon={UsersIcon}
              label="Enrollment"
              value={`${enrollments.length}${
                typeof lesson.maxRiders === "number"
                  ? ` / ${lesson.maxRiders}`
                  : ""
              }`}
            />
          ) : null}
        </div>

        {"notes" in lesson && lesson.notes ? (
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileTextIcon className="size-4 text-muted-foreground" />
              Notes
            </div>
            <div className="rounded-md border bg-muted/30 p-3 text-sm text-foreground whitespace-pre-wrap">
              {String(lesson.notes)}
            </div>
          </section>
        ) : null}

        <section className="space-y-2">
          <div className="text-sm font-medium">Enrolled Riders</div>

          {enrollments.length === 0 ? (
            <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              No riders enrolled.
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="divide-y">
                {enrollments.map((enrollment: any) => {
                  const riderName =
                    enrollment.riderName ||
                    enrollment.memberName ||
                    enrollment.name ||
                    enrollment.rider?.name ||
                    "Unnamed rider";

                  return (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between gap-3 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {riderName}
                        </div>

                        {"status" in enrollment && enrollment.status ? (
                          <div className="text-xs text-muted-foreground">
                            {String(enrollment.status)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </DialogContent>
  );
}

function InfoRow(props: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <props.icon className="size-4" />
        <span>{props.label}</span>
      </div>
      <div className="mt-1 text-sm font-medium">{props.value}</div>
    </div>
  );
}
