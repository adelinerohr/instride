import {
  useBoards,
  useSendMessage,
  useServices,
  useTrainers,
} from "@instride/api";
import { MessageAttachmentType } from "@instride/shared";
import { useStore } from "@tanstack/react-form";
import { useRouteContext } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHandler,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { FieldGroup } from "@/shared/components/ui/field";
import { useAppForm } from "@/shared/hooks/use-form";

interface LessonProposalModalPayload {
  trainerId?: string; // explicit override
  forRiderId: string;
  conversationId: string;
  conversationStaffMemberId?: string; // ← add this
}

export const lessonProposalModalHandler =
  DialogHandler.createHandle<LessonProposalModalPayload>();

export function LessonProposalModal() {
  return (
    <Dialog handle={lessonProposalModalHandler}>
      {({ payload }) =>
        payload && (
          <DialogPortal>
            <LessonProposalModalForm {...payload} />
          </DialogPortal>
        )
      }
    </Dialog>
  );
}

export function LessonProposalModalForm({
  conversationId,
  trainerId: payloadTrainerId,
  forRiderId,
  conversationStaffMemberId,
}: LessonProposalModalPayload) {
  const { data: boards } = useBoards();
  const { data: services } = useServices();
  const { data: trainers } = useTrainers();
  const { member } = useRouteContext({ from: "/org/$slug/(authenticated)" });

  const sendMessage = useSendMessage();

  const initialTrainerId = React.useMemo(() => {
    if (payloadTrainerId) return payloadTrainerId;

    // Prefill from the conversation's staff participant if they're a trainer
    if (conversationStaffMemberId) {
      const trainer = trainers?.find(
        (t) => t.memberId === conversationStaffMemberId
      );
      if (trainer) return trainer.id;
    }

    // Fall back to the viewer being a trainer
    if (member.trainer?.id) return member.trainer.id;

    return "";
  }, [
    payloadTrainerId,
    conversationStaffMemberId,
    trainers,
    member.trainer?.id,
  ]);

  const form = useAppForm({
    defaultValues: {
      boardId: "",
      trainerId: initialTrainerId,
      serviceId: "",
      start: "",
      acknowledgePrivateLesson: true,
    },
    validators: {
      onSubmit: z.object({
        boardId: z.string().min(1, "Board is required"),
        trainerId: z.string().min(1, "Trainer is required"),
        serviceId: z.string().min(1, "Service is required"),
        start: z.string().min(1, "Start is required"),
        acknowledgePrivateLesson: z.boolean(),
      }),
    },
    onSubmit: async ({ value }) => {
      sendMessage.mutateAsync(
        {
          conversationId,
          attachmentType: MessageAttachmentType.LESSON_PROPOSAL,
          attachmentMetadata: {
            ...value,
            riderId: forRiderId,
          },
          forRiderId,
        },
        {
          onSuccess: () => {
            form.reset();
            lessonProposalModalHandler.close();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    },
  });

  // Watch the form state for auto-selection logic
  const selectedTrainerId = useStore(form.store, (s) => s.values.trainerId);
  const selectedBoardId = useStore(form.store, (s) => s.values.boardId);

  // Compute available boards for the selected trainer
  const trainerBoards = React.useMemo(() => {
    const trainer = trainers?.find((t) => t.id === selectedTrainerId);
    return (boards ?? []).filter((b) =>
      trainer?.boardAssignments.some((a) => a.boardId === b.id)
    );
  }, [selectedTrainerId, trainers, boards]);

  // Auto-select board when only one option exists
  React.useEffect(() => {
    if (trainerBoards.length === 1) {
      const onlyBoardId = trainerBoards[0].id;
      // Guard against redundant updates (prevents render loops)
      if (form.state.values.boardId !== onlyBoardId) {
        form.setFieldValue("boardId", onlyBoardId);
      }
    }
  }, [trainerBoards, form]);

  // Compute available services for the trainer + board combo
  const trainerServices = React.useMemo(() => {
    return (services ?? []).filter(
      (svc) =>
        svc.boardAssignments.some((a) => a.boardId === selectedBoardId) &&
        svc.trainerAssignments.some((a) => a.trainerId === selectedTrainerId)
    );
  }, [selectedBoardId, selectedTrainerId, services]);

  // Auto-select service when only one option exists
  React.useEffect(() => {
    if (trainerServices.length === 1) {
      const onlyServiceId = trainerServices[0].id;
      if (form.state.values.serviceId !== onlyServiceId) {
        form.setFieldValue("serviceId", onlyServiceId);
      }
    }
  }, [trainerServices, form]);

  return (
    <DialogContent>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <DialogHeader>
          <DialogTitle>Propose a lesson</DialogTitle>
          <DialogDescription>
            Quick draft &mdash; they'll see a card with Yes/No
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <form.AppField
            name="trainerId"
            children={(field) => (
              <field.TrainerSelectField trainers={trainers ?? []} />
            )}
          />
          <form.AppField
            name="boardId"
            children={(field) => (
              <field.SelectField
                items={trainerBoards}
                label="Board"
                disabled={trainerBoards.length <= 1}
                emptyPlaceholder="No boards available"
                placeholder="Select a board"
                itemToValue={(board) => board.id}
                renderValue={(board) => board.name}
              />
            )}
          />
          <form.AppField
            name="serviceId"
            children={(field) => (
              <field.ServiceSelectField
                services={trainerServices}
                disabled={trainerServices.length <= 1}
                placeholder="Select a service"
              />
            )}
          />
          <form.AppField
            name="start"
            children={(field) => <field.DatetimeField label="Start" />}
          />
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <form.AppForm>
            <form.SubmitButton label="Send" />
          </form.AppForm>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
