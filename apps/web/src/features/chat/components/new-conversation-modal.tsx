import { useCreateConversation, useRiders } from "@instride/api";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";

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
import { FieldGroup } from "@/shared/components/ui/field";
import { useAppForm } from "@/shared/hooks/use-form";
import { getConversationLink } from "@/shared/lib/navigation/links";
import { formatError } from "@/shared/lib/utils/errors";

export const newConversationModalHandler = DialogHandler.createHandle();

export function NewConversationModal() {
  const { data: riders } = useRiders();
  const { isPortal, organization } = useRouteContext({
    from: "/org/$slug/(authenticated)",
  });
  const createConversation = useCreateConversation();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      selectedRider: "",
      message: "",
    },
    onSubmit: async ({ value }) => {
      createConversation.mutateAsync(
        {
          subjectRiderIds: [value.selectedRider],
          initialMessage: {
            body: value.message.trim(),
          },
        },
        {
          onSuccess: ({ conversation }) => {
            form.reset();
            newConversationModalHandler.close();
            const conversationLink = getConversationLink(
              organization.slug,
              conversation.id,
              isPortal
            );
            navigate(conversationLink);
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    },
  });

  return (
    <Dialog handle={newConversationModalHandler}>
      <DialogPortal>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>New conversation</DialogTitle>
            </DialogHeader>
            <FieldGroup>
              <form.AppField
                name="selectedRider"
                children={(field) => (
                  <field.RiderSelectField
                    riders={riders ?? []}
                    placeholder="Select a rider"
                    label="To"
                  />
                )}
              />
              <form.Subscribe selector={(state) => state.values.selectedRider}>
                {(selectedRider) => {
                  const rider = riders?.find(
                    (rider) => rider.id === selectedRider
                  );

                  return (
                    <form.AppField
                      name="message"
                      validators={{
                        onSubmit: ({ value }) => {
                          const trimmed = value.trim();

                          if (!trimmed || trimmed.length === 0) {
                            return formatError("Message is required");
                          }
                        },
                      }}
                      children={(field) => (
                        <field.TextareaField
                          placeholder={
                            rider
                              ? `Say hi to ${rider.member.authUser.name}…`
                              : "Type a message…"
                          }
                          label="Message"
                          rows={4}
                        />
                      )}
                    />
                  );
                }}
              </form.Subscribe>
            </FieldGroup>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <form.AppForm>
                <form.SubmitButton label="Start chat" />
              </form.AppForm>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
