import type { Message } from "@instride/api";

export type MessageRunPosition = "first" | "middle" | "last" | "only";

export interface GroupedMessage {
  message: Message;
  position: MessageRunPosition;
  showDayDivider: boolean;
  dayLabel: string | null;
}

const RUN_BREAK_MS = 5 * 60 * 1000; // 5 minutes between messages = new run

export function groupMessages(messages: Message[]): GroupedMessage[] {
  return messages.map((message, index) => {
    const prev = messages[index - 1];
    const next = messages[index + 1];

    const sameSenderAsPrev =
      prev !== undefined &&
      prev.senderId === message.senderId &&
      isSameDay(new Date(prev.createdAt), new Date(message.createdAt)) &&
      new Date(message.createdAt).getTime() -
        new Date(prev.createdAt).getTime() <
        RUN_BREAK_MS;

    const sameSenderAsNext =
      next !== undefined &&
      next.senderId === message.senderId &&
      isSameDay(new Date(next.createdAt), new Date(message.createdAt)) &&
      new Date(next.createdAt).getTime() -
        new Date(message.createdAt).getTime() <
        RUN_BREAK_MS;

    let position: MessageRunPosition;
    if (!sameSenderAsPrev && !sameSenderAsNext) position = "only";
    else if (!sameSenderAsPrev) position = "first";
    else if (!sameSenderAsNext) position = "last";
    else position = "middle";

    const showDayDivider =
      prev === undefined ||
      !isSameDay(new Date(prev.createdAt), new Date(message.createdAt));

    return {
      message,
      position,
      showDayDivider,
      dayLabel: showDayDivider
        ? formatDayLabel(new Date(message.createdAt))
        : null,
    };
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}
