import {
  Conversation,
  Message,
  MessageResponse,
} from "@instride/api/contracts";
import { api, StreamInOut } from "encore.dev/api";
import log from "encore.dev/log";
import { Subscription } from "encore.dev/pubsub";

import { requireOrganizationAuth } from "@/shared/auth";

import { memberRepo } from "../organizations/members/member.repo";
import { chatRepo } from "./chat.repo";
import { toConversation, toMessage, toMessageResponse } from "./mappers";
import {
  chatConversationUpdated,
  chatMessageCreated,
  chatMessageUpdated,
  chatResponseUpdated,
} from "./topics";

// WebSocket streaming layer for chat. Two responsibilities:
//
//   1. Accept WebSocket connections via api.streamInOut, register each in
//      an in-process Map keyed by connection ID. Each connection records
//      the authenticated member, so we know who to fan out to.
//
//   2. Subscribe to chat-domain Pub/Sub topics. When an event fires,
//      look up which local connections belong to the recipient set and
//      push the event over those WebSockets.
//
// The Pub/Sub-as-bus pattern is what makes this multi-instance safe.
// Encore Pub/Sub subscribers run on every instance, so each instance
// fans out to ITS local connections. A user with two open tabs on
// different instances gets the update on both, because both instances'
// subscribers fire.
//
// What flows over the stream:
//
//   Inbound (client → server):
//     - Heartbeat pings (just to keep the connection alive)
//     - "Currently viewing conversation X" hints (future: presence)
//
//   Outbound (server → client):
//     - { type: "message_created", message }
//     - { type: "message_updated", messageId, changeKind, message? }
//     - { type: "response_updated", messageId, response }
//     - { type: "conversation_updated", conversationId, changeKind, conversation? }
//
// All actual mutations go through HTTP APIs, NOT through the stream.
// The stream is read-only on the server side except for presence hints.

// ---------------------------------------------------------------------------
// Wire types
// ---------------------------------------------------------------------------

/**
 * Inbound (client → server). Most chat protocol traffic goes over HTTP;
 * the stream's inbound channel is for low-frequency things like presence
 * and heartbeats.
 *
 * type='ping'    — keepalive, no other fields
 * type='viewing' — informs server of the conversation the client is viewing;
 *                  conversationId may be null when navigating away
 */
export interface ChatStreamInbound {
  type: "ping" | "viewing";
  conversationId?: string | null;
}

/**
 * Outbound (server → client). The frontend dispatches these into the
 * TanStack Query cache.
 *
 * Field presence by `type`:
 *   hello                — memberId
 *   message_created      — message
 *   message_updated      — messageId, changeKind, message (null if deleted)
 *   response_updated     — messageId, response
 *   conversation_updated — conversationId, changeKind, conversation (null if hard-deleted)
 *
 * All payload fields are optional in the type because Encore's parser
 * needs a flat shape; the runtime contract is enforced by the producers
 * in this file.
 */
export interface ChatStreamOutbound {
  type:
    | "hello"
    | "message_created"
    | "message_updated"
    | "response_updated"
    | "conversation_updated";
  memberId?: string;
  messageId?: string;
  conversationId?: string;
  changeKind?:
    | "edited"
    | "deleted"
    | "created"
    | "participants_changed"
    | "metadata_changed";
  message?: Message | null;
  response?: MessageResponse | null;
  conversation?: Conversation | null;
}

// ---------------------------------------------------------------------------
// Connection registry (in-process)
// ---------------------------------------------------------------------------

interface Connection {
  connectionId: string;
  memberId: string;
  organizationId: string;
  stream: StreamInOut<ChatStreamInbound, ChatStreamOutbound>;
  /**
   * The conversation the client is currently viewing, if any. Updated
   * via inbound "viewing" messages. Currently informational only;
   * could be used later to skip pushing updates the user can't see.
   */
  currentlyViewing: string | null;
}

const connections = new Map<string, Connection>();

/**
 * Push an outbound payload to all connections whose member is in the
 * recipient set. Best-effort — failures are logged but don't propagate.
 *
 * Keying on memberId means a single user with multiple tabs/devices
 * gets the update on all of them, which is what we want.
 */
const fanout = async (
  recipientMemberIds: string[],
  payload: ChatStreamOutbound
): Promise<void> => {
  const recipientSet = new Set(recipientMemberIds);
  const targets: Connection[] = [];
  for (const conn of connections.values()) {
    if (recipientSet.has(conn.memberId)) {
      targets.push(conn);
    }
  }

  // Send in parallel; collect failures for cleanup
  const results = await Promise.allSettled(
    targets.map((conn) => conn.stream.send(payload))
  );

  for (let i = 0; i < results.length; i++) {
    const settled = results[i];
    if (settled.status === "rejected") {
      const conn = targets[i];
      log.warn("chat stream send failed; removing connection", {
        connectionId: conn.connectionId,
        memberId: conn.memberId,
        error: settled.reason,
      });
      connections.delete(conn.connectionId);
    }
  }
};

// ---------------------------------------------------------------------------
// Stream endpoint
// ---------------------------------------------------------------------------

/**
 * Handshake sent by the client when establishing the WebSocket. Carries
 * a client-generated connection ID so both sides can correlate this
 * specific connection (useful for reconnect logic and for the client to
 * filter out its own broadcast echoes if it ever needs to).
 */
interface ChatStreamHandshake {
  connectionId: string;
}

/**
 * The streaming WebSocket endpoint. Auth-required: members only.
 *
 * Connection lifecycle:
 *   1. Client sends a handshake with its self-generated connectionId
 *   2. Server resolves the authenticated member from auth context
 *   3. Server registers the connection in the local Map keyed by connectionId
 *   4. Server sends "hello" so client knows the stream is live
 *   5. Server iterates inbound messages (pings, presence) until disconnect
 *   6. On any exit path, server removes the connection from the Map
 */
export const chatStream = api.streamInOut<
  ChatStreamHandshake,
  ChatStreamInbound,
  ChatStreamOutbound
>(
  {
    expose: true,
    auth: true,
    path: "/chat/stream",
  },
  async (handshake, stream) => {
    const { userID, organizationId } = requireOrganizationAuth();

    // Authentication shape — matches your existing requireOrganizationAuth.
    // Adjust field names if your AuthData has different keys.
    const { id: memberId } = await memberRepo.findOneByUser(
      userID,
      organizationId
    );

    const conn: Connection = {
      connectionId: handshake.connectionId,
      memberId,
      organizationId,
      stream,
      currentlyViewing: null,
    };
    connections.set(handshake.connectionId, conn);

    log.info("chat stream connected", {
      connectionId: handshake.connectionId,
      memberId,
    });

    try {
      // Tell the client the stream is live so it can reconcile its state.
      await stream.send({ type: "hello", memberId });

      for await (const inbound of stream) {
        switch (inbound.type) {
          case "ping":
            // No-op — keepalive. Could echo a pong if needed.
            break;
          case "viewing":
            // conversationId is optional in the wire shape; treat
            // undefined the same as null (navigated away).
            conn.currentlyViewing = inbound.conversationId ?? null;
            break;
        }
      }
    } catch (err) {
      log.warn("chat stream error", {
        connectionId: handshake.connectionId,
        error: err,
      });
    } finally {
      connections.delete(handshake.connectionId);
      log.info("chat stream disconnected", {
        connectionId: handshake.connectionId,
      });
    }
  }
);

// ---------------------------------------------------------------------------
// Pub/Sub subscribers
// ---------------------------------------------------------------------------
//
// Each subscriber loads the data needed for the outbound payload, then
// fans out to local connections. Loading happens here (not in the
// publisher) so the topic payload stays small.

const _messageCreatedSub = new Subscription(
  chatMessageCreated,
  "chat-stream-message-created",
  {
    handler: async (event) => {
      try {
        const message = await chatRepo.findOneMessage(event.messageId);
        await fanout(event.recipientMemberIds, {
          type: "message_created",
          message: toMessage(message),
        });
      } catch (err) {
        log.error("failed to fan out chat message created", {
          messageId: event.messageId,
          error: err,
        });
      }
    },
  }
);

const _messageUpdatedSub = new Subscription(
  chatMessageUpdated,
  "chat-stream-message-updated",
  {
    handler: async (event) => {
      try {
        // For deletions we send a null message — clients use the messageId
        // to remove from their cache. For edits we send the updated message.
        let message = null;
        if (event.changeKind === "edited") {
          const found = await chatRepo.findOneMessage(event.messageId);
          message = toMessage(found);
        }
        await fanout(event.recipientMemberIds, {
          type: "message_updated",
          messageId: event.messageId,
          changeKind: event.changeKind,
          message,
        });
      } catch (err) {
        log.error("failed to fan out chat message updated", {
          messageId: event.messageId,
          error: err,
        });
      }
    },
  }
);

const _responseUpdatedSub = new Subscription(
  chatResponseUpdated,
  "chat-stream-response-updated",
  {
    handler: async (event) => {
      try {
        // Reload the response with relations so the contract shape is
        // fully populated. This is the same query the saga's
        // loadResponseWithRelations uses; consider extracting if it
        // becomes load-bearing.
        const response = await chatRepo.findOneMessageResponse(event.messageId);
        if (!response) {
          log.warn("response_updated fanout: response not found", {
            messageId: event.messageId,
          });
          return;
        }
        await fanout(event.recipientMemberIds, {
          type: "response_updated",
          messageId: event.messageId,
          response: toMessageResponse(response),
        });
      } catch (err) {
        log.error("failed to fan out chat response updated", {
          messageId: event.messageId,
          error: err,
        });
      }
    },
  }
);

const _conversationUpdatedSub = new Subscription(
  chatConversationUpdated,
  "chat-stream-conversation-updated",
  {
    handler: async (event) => {
      try {
        // For "created" and "metadata_changed", clients want the full
        // conversation. For "participants_changed", the client may also
        // want it (their participant list might be stale). Send it for
        // all cases.
        let conversation = null;
        try {
          const found = await chatRepo.findOneConversation(
            event.conversationId,
            event.organizationId
          );
          conversation = toConversation(found);
        } catch {
          // Conversation may have been hard-deleted; send null and let
          // the client remove from its cache.
        }
        await fanout(event.recipientMemberIds, {
          type: "conversation_updated",
          conversationId: event.conversationId,
          changeKind: event.changeKind,
          conversation,
        });
      } catch (err) {
        log.error("failed to fan out conversation updated", {
          conversationId: event.conversationId,
          error: err,
        });
      }
    },
  }
);
