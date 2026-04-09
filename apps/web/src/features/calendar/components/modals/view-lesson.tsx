import { useGetLessonInstance } from "@instride/api";
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
  DialogPortal,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import { useCalendarSearch } from "../../hooks/use-calendar-search";

interface ViewLessonModalProps {
  organizationId: string;
  lessonId: string;
  open: boolean;
}

export function ViewLessonModal({
  organizationId,
  lessonId,
  open,
}: ViewLessonModalProps) {
  const { closeModals } = useCalendarSearch(false);
  const { data, isLoading, isError } = useGetLessonInstance(
    organizationId,
    lessonId
  );

  if (!data) return null;

  const instance = data?.instance;
  const enrollments = data?.enrollments || [];

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModals();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogContent className="max-w-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-base font-semibold">
                {isLoading
                  ? "Loading lesson..."
                  : instance?.name?.trim() || "Lesson Details"}
              </DialogTitle>

              {!isLoading && instance && (
                <p className="mt-1 text-sm text-muted-foreground">
                  View lesson information and enrollment details
                </p>
              )}
            </div>

            <DialogClose className="shrink-0" />
          </div>

          {isLoading && (
            <div className="py-8 text-sm text-muted-foreground">
              Loading lesson details…
            </div>
          )}

          {isError && (
            <div className="py-8 text-sm text-destructive">
              Failed to load lesson details.
            </div>
          )}

          {!isLoading && !isError && !instance && (
            <div className="py-8 text-sm text-muted-foreground">
              Lesson not found.
            </div>
          )}

          {!isLoading && !isError && instance && (
            <div className="mt-5 space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoRow
                  icon={CalendarDaysIcon}
                  label="Date"
                  value={format(new Date(instance.start), "EEEE, MMMM d, yyyy")}
                />

                <InfoRow
                  icon={Clock3Icon}
                  label="Time"
                  value={`${format(new Date(instance.start), "h:mm a")} – ${format(
                    new Date(instance.end),
                    "h:mm a"
                  )}`}
                />

                {"trainerName" in instance && instance.trainerName ? (
                  <InfoRow
                    icon={UserIcon}
                    label="Trainer"
                    value={String(instance.trainerName)}
                  />
                ) : null}

                {"maxRiders" in instance ? (
                  <InfoRow
                    icon={UsersIcon}
                    label="Enrollment"
                    value={`${enrollments.length}${
                      typeof instance.maxRiders === "number"
                        ? ` / ${instance.maxRiders}`
                        : ""
                    }`}
                  />
                ) : null}
              </div>

              {"notes" in instance && instance.notes ? (
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileTextIcon className="size-4 text-muted-foreground" />
                    Notes
                  </div>
                  <div className="rounded-md border bg-muted/30 p-3 text-sm text-foreground whitespace-pre-wrap">
                    {String(instance.notes)}
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
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
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
