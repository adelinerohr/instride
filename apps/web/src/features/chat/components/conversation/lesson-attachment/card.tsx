import type { MessageResponse, RiderSummary } from "@instride/api";
import { getUser } from "@instride/api";
import { formatTime, MessageResponseStatus } from "@instride/shared";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckIcon,
  CircleHelpIcon,
  ClockIcon,
  MapPinIcon,
  TicketIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";

import type { LessonView } from "@/features/chat/lib/types";
import { LevelBadge } from "@/features/organization/components/levels/level-badge";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tag, TagGroup } from "@/shared/components/ui/tag";
import { categoryColorClasses } from "@/shared/lib/config/colors";
import { cn } from "@/shared/lib/utils";

export type LessonAttachmentKind = "invite" | "proposal";

interface LessonAttachmentCardProps {
  view: LessonView;
  /**
   * The recipient rider this is for. Always shown on the card.
   * (Skip if you ever want a "for me" variant — currently always shown.)
   */
  forRider: RiderSummary;
  response: MessageResponse;
  kind: LessonAttachmentKind;
  /** The viewer's perspective — "own" hides the action buttons. */
  direction: "own" | "other";
  timestamp: Date;
  onRespond?: (action: "accept" | "decline") => void;
  isResponding?: boolean;
}

export function LessonAttachmentCard({
  view,
  forRider,
  response,
  kind,
  direction,
  timestamp,
  onRespond,
  isResponding = false,
}: LessonAttachmentCardProps) {
  const showActions =
    direction === "other" &&
    response.status === MessageResponseStatus.PENDING &&
    !!onRespond;

  const isDeclined = response.status === MessageResponseStatus.DECLINED;

  // Color theming per kind. Invite = blue, Request = green/teal.
  const theme = THEMES[response.status];

  return (
    <div
      className={cn(
        "mt-2 flex w-full",
        direction === "own" ? "justify-end" : "justify-start"
      )}
    >
      <div className="flex max-w-[70%] flex-col gap-1">
        <div
          className={cn(
            "flex flex-col overflow-hidden rounded-2xl border bg-card",
            theme.border
          )}
        >
          {/* Top accent bar */}
          <div className={cn("h-1 w-full", theme.primary)} />

          {/* Header strip — kind label + status badge */}
          <div
            className={cn(
              "flex items-center justify-between px-4 py-2 gap-4",
              theme.bg
            )}
          >
            <span
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide",
                theme.fg
              )}
            >
              <TicketIcon className="size-3.5" />
              {kind === "invite" ? "Lesson invite" : "Lesson request"}
            </span>
            <StatusBadge status={response.status} />
          </div>

          {/* Body */}
          <div className="flex flex-col gap-3 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <h3
                className={cn(
                  "font-semibold text-foreground leading-tight",
                  isDeclined && "line-through text-muted-foreground"
                )}
              >
                {view.title}
              </h3>
            </div>

            {view.level && <LevelBadge level={view.level} />}

            <TagGroup direction="vertical">
              <Tag icon={CalendarIcon}>
                <span className="font-medium text-foreground">
                  {format(view.start, "EE, MMM d")}
                </span>{" "}
                &middot;{" "}
                <span className="text-muted-foreground">
                  {format(view.start, "h:mm a")} - {format(view.end, "h:mm a")}
                </span>
              </Tag>
              <Tag icon={UserIcon}>
                {getUser({ trainer: view.trainer }).name}
              </Tag>
              <Tag icon={MapPinIcon}>
                {view.board.name}
                {view.service.name ? ` · ${view.service.name}` : ""}
              </Tag>
              {view.spots && (
                <Tag icon={UsersIcon}>
                  {view.spots.open} of {view.spots.total} spots open
                </Tag>
              )}
            </TagGroup>

            {/* "For [rider]" pill */}
            <div className="flex items-center gap-1 rounded-md bg-muted/50 px-3 py-2 text-xs">
              <span className="text-muted-foreground">For</span>
              <span className="font-medium text-foreground">
                {forRider.member.authUser.name}
              </span>
            </div>
          </div>

          {/* Actions or settled footer */}
          {showActions ? (
            <div className="flex gap-2 border-t border-border/60 px-4 py-3">
              <Button
                size="sm"
                className="flex-1"
                disabled={isResponding}
                onClick={() => onRespond?.("accept")}
              >
                <CheckIcon className="size-4" />
                Yes, count us in
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                disabled={isResponding}
                onClick={() => onRespond?.("decline")}
              >
                <XIcon className="size-4" />
                No
              </Button>
            </div>
          ) : (
            <SettledFooter response={response} timestamp={timestamp} />
          )}
        </div>

        <span
          className={cn(
            "text-xs text-muted-foreground",
            direction === "own" ? "text-right" : "text-left"
          )}
        >
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Theme — kind drives colors
// ─────────────────────────────────────────────────────────────────────

const THEMES: Record<
  MessageResponseStatus,
  ReturnType<typeof categoryColorClasses>
> = {
  [MessageResponseStatus.PENDING]: categoryColorClasses("slate"),
  [MessageResponseStatus.PROCESSING]: categoryColorClasses("clay"),
  [MessageResponseStatus.ACCEPTED]: categoryColorClasses("sage"),
  [MessageResponseStatus.DECLINED]: categoryColorClasses("terracotta"),
  [MessageResponseStatus.CANCELLED]: categoryColorClasses("clay"),
  [MessageResponseStatus.FAILED]: categoryColorClasses("plum"),
} as const;

// ─────────────────────────────────────────────────────────────────────
// Status badge in the header strip
// ─────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: MessageResponseStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.unknown;
  const theme = THEMES[status];

  return (
    <Badge variant="outline" className={cn(theme.border, theme.fg, "bg-white")}>
      <div className={cn("rounded-full size-2", theme.primary)} />
      {config.label}
    </Badge>
  );
}

const STATUS_CONFIG = {
  [MessageResponseStatus.PENDING]: {
    label: "Awaiting reply",
    icon: ClockIcon,
  },
  [MessageResponseStatus.PROCESSING]: {
    label: "Processing",
    icon: ClockIcon,
  },
  [MessageResponseStatus.ACCEPTED]: {
    label: "Accepted",
    icon: CheckIcon,
  },
  [MessageResponseStatus.DECLINED]: {
    label: "Declined",
    icon: XIcon,
  },
  [MessageResponseStatus.CANCELLED]: {
    label: "Cancelled",
    icon: XIcon,
  },
  [MessageResponseStatus.FAILED]: {
    label: "Failed",
    icon: CircleHelpIcon,
  },
  unknown: {
    label: "Unknown",
    icon: CircleHelpIcon,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────
// Settled footer — "Confirmed by Megan", "Declined by Megan", etc.
// ─────────────────────────────────────────────────────────────────────

function SettledFooter({
  response,
  timestamp,
}: {
  response: MessageResponse;
  timestamp: Date;
}) {
  const { status, responder, respondedAt } = response;
  if (
    status === MessageResponseStatus.PENDING ||
    status === MessageResponseStatus.PROCESSING
  ) {
    return null;
  }

  const responderName = responder ? getUser({ member: responder }).name : null;

  let label: string;
  switch (status) {
    case MessageResponseStatus.ACCEPTED:
      label = responderName ? `Confirmed by ${responderName}` : "Confirmed";
      break;
    case MessageResponseStatus.DECLINED:
      label = responderName ? `Declined by ${responderName}` : "Declined";
      break;
    case MessageResponseStatus.CANCELLED:
      label = "Cancelled";
      break;
    case MessageResponseStatus.FAILED:
      label = response.failureReason
        ? `Couldn't process: ${response.failureReason}`
        : "Couldn't process";
      break;
    default:
      label = "";
  }

  const when = respondedAt ? new Date(respondedAt) : timestamp;

  return (
    <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
      <span>{label}</span>
      <span>{formatTime(when)}</span>
    </div>
  );
}
