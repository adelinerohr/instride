import {
  InfiniteData,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";

import { apiClient } from "#client";
import {
  Conversation,
  ConversationSummary,
  ListConversationsResponse,
  Message,
  MessageResponse,
} from "#contracts";

import { chatKeys } from "./keys";

// ---------------------------------------------------------------------------
// Wire types — must mirror the server-side ChatStreamOutbound in stream.ts
// ---------------------------------------------------------------------------

type StreamHello = { type: "hello"; memberId: string };

type StreamMessageCreated = {
  type: "message_created";
  message: Message;
};

type StreamMessageUpdated = {
  type: "message_updated";
  messageId: string;
  changeKind: "edited" | "deleted";
  message: Message | null;
};

type StreamResponseUpdated = {
  type: "response_updated";
  messageId: string;
  response: MessageResponse;
};

type StreamConversationUpdated = {
  type: "conversation_updated";
  conversationId: string;
  changeKind: "created" | "participants_changed" | "metadata_changed";
  conversation: Conversation | null;
};

type StreamOutbound =
  | StreamHello
  | StreamMessageCreated
  | StreamMessageUpdated
  | StreamResponseUpdated
  | StreamConversationUpdated;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export type ChatStreamHandle = {
  /** Close the connection. Idempotent. */
  disconnect: () => void;
};

const DEFAULT_PING_INTERVAL_MS = 30_000;
const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;

export const connectChatStream = (
  pingIntervalMs?: number
): ChatStreamHandle => {
  const queryClient = useQueryClient();
  let stopped = false;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempt = 0;
  let currentStream:
    | (AsyncIterable<StreamOutbound> & {
        send: (msg: { type: "ping" }) => Promise<void>;
        socket: { on: (event: string, fn: (e: unknown) => void) => void };
      })
    | null = null;

  const generateConnectionId = (): string =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `conn-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const startPings = () => {
    const interval = pingIntervalMs ?? DEFAULT_PING_INTERVAL_MS;
    if (interval <= 0) return;
    pingTimer = setInterval(() => {
      currentStream?.send({ type: "ping" }).catch(() => {
        // ping failures will surface as stream errors; nothing to do here
      });
    }, interval);
  };

  const stopPings = () => {
    if (pingTimer) clearInterval(pingTimer);
    pingTimer = null;
  };

  const scheduleReconnect = () => {
    if (stopped) return;
    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** reconnectAttempt,
      RECONNECT_MAX_MS
    );
    reconnectAttempt += 1;
    reconnectTimer = setTimeout(connect, delay);
  };

  const connect = async () => {
    if (stopped) return;
    // Fresh connection ID per reconnect avoids races where the server's
    // cleanup of a stale entry could clobber a freshly reconnected one.
    const connectionId = generateConnectionId();
    try {
      // Open the WebSocket. The handshake carries the connection ID so the
      // server can key its in-memory connection map.
      //
      // The cast lets us use the runtime API without strict typing — the
      // generated client's stream type is opaque to us at the package level.
      const stream = (await apiClient.chat.chatStream({
        connectionId,
      })) as typeof currentStream;
      currentStream = stream;
      reconnectAttempt = 0;
      startPings();

      // On socket close, schedule reconnect. Encore's generated streams
      // expose `socket.on('close', ...)` for this.
      stream?.socket.on("close", () => {
        stopPings();
        currentStream = null;
        scheduleReconnect();
      });
      stream?.socket.on("error", () => {
        // Errors usually precede a close; let the close handler reconnect.
      });

      // Read events until the stream ends.
      //
      // The generated client types events as the server's flat
      // ChatStreamOutbound interface (Encore's parser requires flat
      // interfaces). The local StreamOutbound union is a narrower
      // description of the runtime payload — discriminator + the
      // payload fields actually present for that discriminator.
      // Casting at this boundary lets per-case narrowing in dispatchEvent
      // work correctly without sprinkling guards throughout the handlers.
      if (stream) {
        for await (const event of stream) {
          dispatchEvent(event as StreamOutbound, queryClient, chatKeys);
        }
      }
    } catch {
      stopPings();
      currentStream = null;
      scheduleReconnect();
    }
  };

  // Kick off the first connection
  void connect();

  return {
    disconnect: () => {
      stopped = true;
      stopPings();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      // Best-effort close of the underlying socket. Generated streams
      // don't expose a public close() — we rely on the socket being
      // garbage collected when the iterator is dropped.
      currentStream = null;
    },
  };
};

// ---------------------------------------------------------------------------
// Cache dispatch
// ---------------------------------------------------------------------------

const dispatchEvent = (
  event: StreamOutbound,
  queryClient: QueryClient,
  keys: typeof chatKeys
): void => {
  switch (event.type) {
    case "hello":
      // Connection established. Refresh the inbox in case we missed any
      // updates while disconnected.
      queryClient.invalidateQueries({ queryKey: keys.conversations.all() });
      break;

    case "message_created":
      handleMessageCreated(event, queryClient, keys);
      break;

    case "message_updated":
      handleMessageUpdated(event, queryClient);
      break;

    case "response_updated":
      handleResponseUpdated(event, queryClient);
      break;

    case "conversation_updated":
      handleConversationUpdated(event, queryClient, keys);
      break;
  }
};

// ---------------------------------------------------------------------------
// Event handlers — direct cache updates where cheap, invalidate otherwise
// ---------------------------------------------------------------------------

const handleMessageCreated = (
  event: StreamMessageCreated,
  queryClient: QueryClient,
  keys: typeof chatKeys
): void => {
  const { message } = event;

  // Prepend to the message list (newest first; pages are reverse-chronological).
  queryClient.setQueryData<InfiniteData<{ messages: Message[] }>>(
    keys.conversations.messages(message.conversationId),
    (data) => {
      if (!data) return data;
      const [firstPage, ...rest] = data.pages;
      if (!firstPage) return data;
      // Avoid duplicates: if the message already arrived via the optimistic
      // mutation response, skip the prepend.
      if (firstPage.messages.some((m) => m.id === message.id)) return data;
      return {
        ...data,
        pages: [
          { ...firstPage, messages: [message, ...firstPage.messages] },
          ...rest,
        ],
      };
    }
  );

  // Bump lastMessageAt + lastMessage on the inbox summary.
  queryClient.setQueryData<ListConversationsResponse>(
    keys.conversations.list(),
    (data) => {
      if (!data) return data;

      const idx = data.conversations.findIndex(
        (c) => c.id === message.conversationId
      );

      if (idx === -1) {
        // Conversation isn't in the list yet — invalidate to fetch it.
        queryClient.invalidateQueries({
          queryKey: keys.conversations.all(),
        });
        return data;
      }

      const convo = data.conversations[idx];
      if (!convo) return data;

      const updated: ConversationSummary = {
        ...convo,
        lastMessage: message,
        lastMessageAt: message.createdAt,
        // Bump unread count if the message isn't ours. We don't have the
        // current member ID at this layer; the safer move is to invalidate
        // and let the inbox query refetch its unreadCount values.
      };
      const next = [...data.conversations];
      next.splice(idx, 1);
      next.unshift(updated); // move to top
      return { ...data, conversations: next };
    }
  );

  // Refresh unread counts (we can't compute them here without member ID).
  queryClient.invalidateQueries({
    queryKey: keys.conversations.list(),
    exact: false,
  });
};

const handleMessageUpdated = (
  event: StreamMessageUpdated,
  queryClient: QueryClient
): void => {
  // Find the message in any cached page and update it. Since the event
  // doesn't include conversationId for deleted messages, we have to walk
  // every cached message list. For typical apps this is a handful of
  // queries at most.
  const queries = queryClient.getQueriesData<
    InfiniteData<{ messages: Message[] }>
  >({ queryKey: ["chat"] });

  for (const [queryKey, data] of queries) {
    if (!data?.pages) continue;
    let found = false;
    const newPages = data.pages.map((page) => {
      if (!page.messages) return page;
      const messageIdx = page.messages.findIndex(
        (m) => m.id === event.messageId
      );
      if (messageIdx === -1) return page;
      found = true;

      if (event.changeKind === "deleted") {
        // Soft-delete: keep the row but mark deletedAt so the UI can
        // render a "deleted message" placeholder. The server hasn't told
        // us the deletedAt timestamp; use now as a best guess.
        const existing = page.messages[messageIdx];
        if (!existing) return page;

        const updated = {
          ...existing,
          deletedAt: new Date().toISOString(),
          body: null,
        };

        const next = [...page.messages];
        next[messageIdx] = updated;
        return { ...page, messages: next };
      }

      // Edited
      if (event.message) {
        const next = [...page.messages];
        next[messageIdx] = event.message;
        return { ...page, messages: next };
      }
      return page;
    });

    if (found) {
      queryClient.setQueryData(queryKey, { ...data, pages: newPages });
    }
  }
};

const handleResponseUpdated = (
  event: StreamResponseUpdated,
  queryClient: QueryClient
): void => {
  // Update the response inline on whichever message it belongs to.
  const queries = queryClient.getQueriesData<
    InfiniteData<{ messages: Message[] }>
  >({ queryKey: ["chat"] });

  for (const [queryKey, data] of queries) {
    if (!data?.pages) continue;
    let found = false;
    const newPages = data.pages.map((page) => {
      if (!page.messages) return page;
      const messageIdx = page.messages.findIndex(
        (m) => m.id === event.messageId
      );
      if (messageIdx === -1) return page;
      found = true;
      const next = [...page.messages];

      const existing = next[messageIdx];
      if (!existing) return page;

      next[messageIdx] = {
        ...existing,
        response: event.response,
      };

      return { ...page, messages: next };
    });
    if (found) {
      queryClient.setQueryData(queryKey, { ...data, pages: newPages });
    }
  }
};

const handleConversationUpdated = (
  event: StreamConversationUpdated,
  queryClient: QueryClient,
  keys: typeof chatKeys
): void => {
  // Replace the cached single-conversation entry if we have one.
  if (event.conversation) {
    queryClient.setQueryData(keys.conversations.byId(event.conversationId), {
      conversation: event.conversation,
    });
  }

  // Inbox summaries need a refetch — we don't have unreadCount/lastMessage
  // here so we can't update in place safely.
  queryClient.invalidateQueries({
    queryKey: keys.conversations.list(),
    exact: false,
  });

  // For "created" events we definitely want the inbox refetched.
  if (event.changeKind === "created") {
    queryClient.invalidateQueries({
      queryKey: keys.conversations.all(),
    });
  }
};
