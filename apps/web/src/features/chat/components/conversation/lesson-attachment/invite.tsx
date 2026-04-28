import type { LessonInstance, MessageResponse } from "@instride/api";
import { useRespondToMessage } from "@instride/api";

import { normalizeLesson } from "@/features/chat/lib/types";

import { LessonAttachmentCard } from "./card";

interface InviteAttachmentProps {
  lesson: LessonInstance;
  response: MessageResponse;
  direction: "own" | "other";
  timestamp: Date;
}

export function InviteAttachment({
  lesson,
  response,
  direction,
  timestamp,
}: InviteAttachmentProps) {
  const respond = useRespondToMessage();

  return (
    <LessonAttachmentCard
      view={normalizeLesson(lesson)}
      forRider={response.forRider}
      response={response}
      kind="invite"
      direction={direction}
      timestamp={timestamp}
      onRespond={(action) =>
        respond.mutate({ messageId: response.messageId, action })
      }
      isResponding={respond.isPending}
    />
  );
}
