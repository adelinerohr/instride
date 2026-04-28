import type { LessonProposalPayload, MessageResponse } from "@instride/api";
import {
  useBoard,
  useRespondToMessage,
  useService,
  useTrainer,
} from "@instride/api";

import { normalizeProposal } from "@/features/chat/lib/types";

import { LessonAttachmentCard } from "./card";

interface ProposalAttachmentProps {
  proposal: LessonProposalPayload;
  response: MessageResponse;
  direction: "own" | "other";
  timestamp: Date;
}

export function ProposalAttachment({
  proposal,
  response,
  direction,
  timestamp,
}: ProposalAttachmentProps) {
  const respond = useRespondToMessage();
  const { data: board } = useBoard(proposal.boardId);
  const { data: service } = useService(proposal.serviceId);
  const { data: trainer } = useTrainer(proposal.trainerId);

  // While the supporting data loads, render nothing. Could also render a
  // skeleton card here if the wait is noticeable in practice.
  if (!board || !service || !trainer) return null;

  return (
    <LessonAttachmentCard
      view={normalizeProposal({ proposal, board, service, trainer })}
      forRider={response.forRider}
      response={response}
      kind="proposal"
      direction={direction}
      timestamp={timestamp}
      onRespond={(action) =>
        respond.mutate({ messageId: response.messageId, action })
      }
      isResponding={respond.isPending}
    />
  );
}
