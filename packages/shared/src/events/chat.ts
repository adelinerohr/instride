export interface ChatMessageCreatedEvent {
  messageId: string;
  conversationId: string;
  organizationId: string;
  senderId: string;
  /**
   * Member IDs that should receive this update — typically the active
   * participants of the conversation. The stream layer uses this to
   * decide which connections to push to.
   */
  recipientMemberIds: string[];
  createdAt: string;
}

export interface ChatMessageUpdatedEvent {
  messageId: string;
  conversationId: string;
  organizationId: string;
  recipientMemberIds: string[];
  /** "edited" | "deleted" — consumers may render differently. */
  changeKind: "edited" | "deleted";
  updatedAt: string;
}

export interface ChatResponseUpdatedEvent {
  messageId: string;
  conversationId: string;
  organizationId: string;
  recipientMemberIds: string[];
  /**
   * The new status. The full response contract is fetched by the stream
   * layer when fanning out — we don't ship it on the topic.
   */
  status: string;
  updatedAt: string;
}

export interface ChatConversationUpdatedEvent {
  conversationId: string;
  organizationId: string;
  recipientMemberIds: string[];
  changeKind: "created" | "participants_changed" | "metadata_changed";
  updatedAt: string;
}
