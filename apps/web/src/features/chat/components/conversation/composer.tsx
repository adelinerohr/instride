import { getUser, useSendMessage, type Conversation } from "@instride/api";
import { ConversationParticipantRole } from "@instride/shared";
import { CalendarPlusIcon, SendIcon, TicketIcon } from "lucide-react";
import * as React from "react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DialogTrigger } from "@/shared/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/shared/components/ui/input-group";
import { PopoverTrigger } from "@/shared/components/ui/popover";

import { useParties } from "../../hooks/use-parties";
import { LessonPicker, lessonPickerHandler } from "./lesson-picker";
import {
  LessonProposalModal,
  lessonProposalModalHandler,
} from "./lesson-proposal-modal";

interface ComposerProps {
  conversation: Conversation;
  viewerMemberId: string;
}

export function Composer({ conversation, viewerMemberId }: ComposerProps) {
  const [body, setBody] = React.useState("");
  const sendMessage = useSendMessage();

  const { recipient } = useParties(conversation, viewerMemberId);

  const handleSend = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    sendMessage.mutate(
      { conversationId: conversation.id, body: trimmed },
      {
        onSuccess: () => setBody(""),
      }
    );
  };

  const recipientUser = getUser({ member: recipient });
  const subjectRiderId = conversation.subjectRiders[0].id;

  const conversationStaffParticipant = conversation.activeParticipants.find(
    (p) => p.role === ConversationParticipantRole.STAFF
  );

  return (
    <div className="shrink-0 border-t border px-6 py-4 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <PopoverTrigger
          handle={lessonPickerHandler}
          render={<Badge variant="outline" className="bg-white" />}
          nativeButton={false}
        >
          <TicketIcon />
          Attach lesson
        </PopoverTrigger>
        <DialogTrigger
          nativeButton={false}
          render={<Badge variant="outline" className="bg-white" />}
          handle={lessonProposalModalHandler}
          payload={{
            conversationId: conversation.id,
            forRiderId: subjectRiderId,
            conversationStaffMemberId: conversationStaffParticipant?.memberId,
          }}
        >
          <CalendarPlusIcon />
          Propose new
        </DialogTrigger>
      </div>

      <InputGroup className="bg-white">
        <InputGroupTextarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={
            recipientUser ? `Message ${recipientUser.name}…` : "Type a message…"
          }
          rows={1}
        />
        <InputGroupAddon align="block-end">
          <Button variant="default" onClick={handleSend} className="ml-auto">
            <SendIcon />
            Send
          </Button>
        </InputGroupAddon>
      </InputGroup>

      <LessonPicker />
      <LessonProposalModal />
    </div>
  );
}
