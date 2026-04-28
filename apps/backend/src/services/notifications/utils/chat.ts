import { Message } from "@instride/api/contracts";
import { MessageAttachmentType, NotificationType } from "@instride/shared";

import { chatRepo } from "@/services/chat/chat.repo";
import { toMessage } from "@/services/chat/mappers";

export function buildNotificationCopy(input: {
  attachmentType: MessageAttachmentType | null;
  senderName: string;
  messageBody: string | null;
}): { type: NotificationType; title: string; message: string } {
  switch (input.attachmentType) {
    case MessageAttachmentType.LESSON_REFERENCE:
      return {
        type: NotificationType.CHAT_LESSON_INVITED,
        title: "Lesson invitation",
        message: `${input.senderName} invited you to a lesson`,
      };
    case MessageAttachmentType.LESSON_PROPOSAL:
      return {
        type: NotificationType.CHAT_LESSON_PROPOSED,
        title: "New lesson proposed",
        message: `${input.senderName} proposed a lesson`,
      };
    default: {
      // Plain message
      const excerpt = input.messageBody
        ? input.messageBody.length > 80
          ? input.messageBody.slice(0, 77) + "..."
          : input.messageBody
        : "Sent you a message";
      return {
        type: NotificationType.CHAT_MESSAGE_RECEIVED,
        title: input.senderName,
        message: excerpt,
      };
    }
  }
}

export async function fetchMessageContext(messageId: string): Promise<Message> {
  const message = await chatRepo.findOneMessage(messageId);
  return toMessage(message);
}
