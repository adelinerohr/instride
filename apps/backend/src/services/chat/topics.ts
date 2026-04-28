import {
  ChatMessageCreatedEvent,
  ChatMessageUpdatedEvent,
  ChatResponseUpdatedEvent,
  ChatConversationUpdatedEvent,
} from "@instride/shared";
import { Topic } from "encore.dev/pubsub";

export const chatMessageCreated = new Topic<ChatMessageCreatedEvent>(
  "chat.message.created",
  { deliveryGuarantee: "at-least-once" }
);

export const chatMessageUpdated = new Topic<ChatMessageUpdatedEvent>(
  "chat.message.updated",
  { deliveryGuarantee: "at-least-once" }
);

export const chatResponseUpdated = new Topic<ChatResponseUpdatedEvent>(
  "chat.response.updated",
  { deliveryGuarantee: "at-least-once" }
);

export const chatConversationUpdated = new Topic<ChatConversationUpdatedEvent>(
  "chat.conversation.updated",
  { deliveryGuarantee: "at-least-once" }
);
