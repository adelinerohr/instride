import type { TimeBlock, Trainer } from "@instride/shared";
import { format } from "date-fns";
import * as React from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogPortal,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import { useCalendarSearch } from "../../hooks/use-calendar-search";
import {
  useCreateTimeBlock,
  useDeleteTimeBlock,
} from "../../hooks/use-time-blocks";

interface TimeBlockFormModalProps {
  existingBlock?: TimeBlock;
  organizationId: string;
  defaultStart?: Date;
  defaultEnd?: Date;
  trainers: Trainer[];
  open: boolean;
}

function toLocalInputValue(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function TimeBlockFormModal({
  existingBlock,
  open,
  organizationId,
  defaultStart,
  defaultEnd,
  trainers,
}: TimeBlockFormModalProps) {
  const { closeModals } = useCalendarSearch(false);
  const createTimeBlock = useCreateTimeBlock(organizationId);
  const deleteTimeBlock = useDeleteTimeBlock();
  const isEdit = !!existingBlock;

  const initialTrainerId =
    existingBlock?.trainerMemberId ?? trainers[0]?.id ?? "";

  const initialStart = existingBlock?.start
    ? toLocalInputValue(new Date(existingBlock.start))
    : defaultStart
      ? toLocalInputValue(defaultStart)
      : "";

  const initialEnd = existingBlock?.end
    ? toLocalInputValue(new Date(existingBlock.end))
    : defaultEnd
      ? toLocalInputValue(defaultEnd)
      : "";

  const [trainerMemberId, setTrainerMemberId] =
    React.useState(initialTrainerId);
  const [start, setStart] = React.useState(initialStart);
  const [end, setEnd] = React.useState(initialEnd);
  const [reason, setReason] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;

    setTrainerMemberId(initialTrainerId);
    setStart(initialStart);
    setEnd(initialEnd);
    setReason("");
    setFormError(null);
  }, [open, initialTrainerId, initialStart, initialEnd]);

  const isSubmitting = createTimeBlock.isPending || deleteTimeBlock.isPending;

  function handleOpenChange(open: boolean) {
    if (!open) {
      closeModals();
    }
  }

  function validate() {
    if (!trainerMemberId) {
      return "Please select a trainer.";
    }

    if (!start || !end) {
      return "Please enter both a start and end time.";
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return "Please enter valid dates.";
    }

    if (endDate <= startDate) {
      return "End time must be after start time.";
    }

    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);

    const payload = {
      organizationId,
      trainerMemberId,
      reason: reason.trim() || null,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
    };

    if (isEdit && existingBlock) {
      // TODO: Implement update time block
    }

    createTimeBlock.mutate(
      {
        request: payload,
        trainerMemberId,
      },
      {
        onSuccess: () => handleOpenChange(false),
      }
    );
  }

  function handleDelete() {
    if (!existingBlock) return;

    deleteTimeBlock.mutate(existingBlock.id, {
      onSuccess: () => handleOpenChange(false),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogContent className="max-w-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-base font-semibold">
                {isEdit ? "Edit Time Block" : "New Time Block"}
              </DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {isEdit
                  ? "Update unavailable time for a trainer"
                  : "Block off unavailable time for a trainer"}
              </p>
            </div>

            <DialogClose className="shrink-0" />
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Trainer</label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={trainerMemberId}
                onChange={(e) => setTrainerMemberId(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Select trainer</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.member.authUser.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Start</label>
                <input
                  type="datetime-local"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">End</label>
                <input
                  type="datetime-local"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Reason</label>
              <input
                type="text"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional"
                disabled={isSubmitting}
              />
            </div>

            {formError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div>
                {isEdit && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="rounded-md border border-destructive px-3 py-2 text-sm text-destructive hover:bg-destructive/5 disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                  className="rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isEdit ? "Save Changes" : "Create Block"}
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
