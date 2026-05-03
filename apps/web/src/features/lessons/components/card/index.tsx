import {
  getLessonName,
  getUser,
  isPrivateLesson,
  type LessonInstance,
  type Rider,
} from "@instride/api";
import { cva, type VariantProps } from "class-variance-authority";
import { format, isBefore, startOfDay } from "date-fns";
import {
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import * as React from "react";

import { LevelBadge } from "@/features/organization/components/fragments/badges";
import { UserAvatar } from "@/shared/components/fragments/user-avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { Tag, TagGroup } from "@/shared/components/ui/tag";
import { categoryColorClasses } from "@/shared/lib/config/colors";
import { cn } from "@/shared/lib/utils";

import { groupLessonsByDay } from "../../lib/utils";

export type LessonCardPerspective =
  | {
      kind: "rider";
      rider: Rider;
      isEnrolled: boolean;
    }
  | { kind: "admin" };

type LessonCardContextProps = {
  lesson: LessonInstance;
  perspective: LessonCardPerspective;
  variant: VariantProps<typeof lessonCardVariants>["variant"];
};

const LessonCardContext = React.createContext<LessonCardContextProps | null>(
  null
);

function useLessonCard() {
  const context = React.useContext(LessonCardContext);
  if (!context) {
    throw new Error("useLessonCard must be used within a LessonCardProvider");
  }
  return context;
}

export type LessonCardListItem = {
  lesson: LessonInstance;
  perspective: LessonCardPerspective;
  onClick?: () => void;
};

function LessonCardList({
  items,
  grouped = false,
  variant = "detail",
  emptyState,
  className,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof lessonCardVariants> & {
    items: LessonCardListItem[];
    emptyState?: React.ReactNode;
    grouped?: boolean;
  }) {
  if (items.length === 0) {
    return <>{emptyState ?? null}</>;
  }

  if (variant === "date-chip" || grouped) {
    return (
      <GroupedLessonCardList
        items={items}
        variant={variant}
        className={className}
        {...props}
      />
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      {items.map((item) => (
        <LessonCard
          key={item.lesson.id}
          lesson={item.lesson}
          perspective={item.perspective}
          variant={variant}
          onClick={item.onClick}
        />
      ))}
    </div>
  );
}

function GroupedLessonCardList({
  items,
  variant = "date-chip",
  className,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof lessonCardVariants> & {
    items: LessonCardListItem[];
  }) {
  const groups = React.useMemo(() => groupLessonsByDay(items), [items]);

  if (variant === "date-chip") {
    return (
      <div className={cn("flex flex-col gap-3", className)} {...props}>
        {groups.map(({ day, items }) => (
          <div
            key={day.toISOString()}
            className="grid grid-cols-[3rem_1fr] gap-x-4"
          >
            <div className="row-start-1 flex justify-center">
              <DateChip day={day} />
            </div>
            <div className="col-start-2 flex flex-col gap-2">
              {items.map((item) => (
                <LessonCard
                  key={item.lesson.id}
                  lesson={item.lesson}
                  perspective={item.perspective}
                  variant={variant}
                  onClick={item.onClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {groups.map(({ day, items }) => {
        const hasPassed = isBefore(day, startOfDay(new Date()));
        return (
          <div
            className={cn("space-y-4", hasPassed && "opacity-50")}
            key={day.toISOString()}
          >
            <div className="sticky top-0 flex items-center gap-2 bg-background">
              <span className="text-2xl font-display leading-none font-semibold">
                {format(day, "dd")}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium">
                  {format(day, "EEEE")}
                </span>
              </span>
              <div className="w-full h-px bg-border" />
              <span className="text-xs text-muted-foreground text-nowrap">
                {items.length} {items.length === 1 ? "lesson" : "lessons"}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <LessonCard
                  key={item.lesson.id}
                  lesson={item.lesson}
                  perspective={item.perspective}
                  variant={variant}
                  onClick={item.onClick}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DateChip({
  day,
  className,
  ...props
}: React.ComponentProps<"div"> & { day: Date }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-muted py-2 px-3 rounded-md w-full",
        className
      )}
      {...props}
    >
      <span className="text-xs leading-none uppercase text-muted-foreground">
        {format(day, "EEE")}
      </span>
      <span className="text-xl font-bold font-display">{format(day, "d")}</span>
    </div>
  );
}

const lessonCardVariants = cva(
  "relative flex bg-card text-card-foreground transition-colors cursor-pointer hover:bg-muted/40 rounded-lg overflow-hidden",
  {
    variants: {
      variant: {
        detail: "items-center gap-4 border px-4 py-3",
        agenda: "gap-2 border",
        "date-chip": "items-start gap-4 p-2",
        compact: "items-center gap-4 border px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "detail",
    },
  }
);

function LessonCard({
  lesson,
  perspective,
  className,
  onClick,
  variant = "detail",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof lessonCardVariants> & {
    lesson: LessonInstance;
    perspective: LessonCardPerspective;
  }) {
  const contextValue = React.useMemo<LessonCardContextProps>(
    () => ({ lesson, perspective, variant }),
    [lesson, perspective, variant]
  );

  const hasPassed = isBefore(new Date(lesson.start), new Date());

  return (
    <LessonCardContext.Provider value={contextValue}>
      <div
        data-slot="lesson-card"
        data-variant={variant}
        data-passed={hasPassed}
        onClick={onClick}
        className={cn(
          lessonCardVariants({ variant }),
          "group/lesson-card",
          hasPassed && "opacity-50",
          className
        )}
        {...props}
      >
        <AccentStripe />
        <LeadingSlot />
        <LessonContent />
        <TrailingSlot />
      </div>
    </LessonCardContext.Provider>
  );
}

function AccentStripe({ className, ...props }: React.ComponentProps<"div">) {
  const { lesson } = useLessonCard();
  const accentStripeClasses = categoryColorClasses(lesson.level?.color);

  return (
    <div
      data-slot="accent-stripe"
      className={cn(
        "shrink-0 self-stretch rounded-full w-1 group-data-[variant=agenda]/lesson-card:w-1.5 group-data-[variant=agenda]/lesson-card:rounded-none",
        accentStripeClasses.bg,
        className
      )}
      {...props}
    />
  );
}

function LeadingSlot({ className, ...props }: React.ComponentProps<"div">) {
  const { lesson, variant } = useLessonCard();
  const start = new Date(lesson.start);

  switch (variant) {
    case "compact":
      return (
        <div
          data-slot="leading-slot"
          className={cn("flex w-12 shrink-0 flex-col items-start", className)}
          {...props}
        >
          <span className="text-base font-semibold tabular-nums">
            {format(start, "h:mm")}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(start, "a")}
          </span>
        </div>
      );
    default:
      return null;
  }
}

function LessonContent({ className, ...props }: React.ComponentProps<"div">) {
  const { lesson, perspective, variant } = useLessonCard();
  const start = new Date(lesson.start);
  const end = new Date(lesson.end);

  const timeRange = `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
  const lessonName = getLessonName(lesson);
  const isPrivate = isPrivateLesson(lesson);
  const openSlots = lesson.maxRiders - (lesson.enrollments?.length ?? 0);

  const trainer = getUser({ trainer: lesson.trainer });
  const rider =
    perspective.kind === "rider" ? getUser({ rider: perspective.rider }) : null;

  switch (variant) {
    case "compact":
      return (
        <div
          data-slot="lesson-content"
          className={cn("flex min-w-0 flex-1 flex-col gap-0.5", className)}
          {...props}
        >
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{lessonName}</span>
            {isPrivate && <Badge variant="secondary">Private</Badge>}
            <CheckIcon className="size-4 shrink-0 hidden group-data-[passed=true]/lesson-card:block" />
          </div>
          <span className="truncate text-xs text-muted-foreground">
            {trainer.name} &middot; {lesson.board.name}
          </span>
        </div>
      );
    case "date-chip":
      return (
        <div
          data-slot="lesson-content"
          className={cn("flex min-w-0 flex-1 flex-col gap-1 py-0.5", className)}
          {...props}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{lessonName}</span>
            <LevelBadge level={lesson.level} />
            {isPrivate && <Badge variant="secondary">Private</Badge>}
          </div>
          <TagGroup direction="horizontal">
            <Tag icon={ClockIcon}>{timeRange}</Tag>
            <Tag icon={UserIcon}>{trainer.name}</Tag>
            {perspective.kind === "rider" && (
              <span className="text-xs font-medium">
                &middot; {rider?.name}
              </span>
            )}
          </TagGroup>
        </div>
      );
    case "agenda":
      return (
        <div
          data-slot="lesson-content"
          className={cn("flex justify-between gap-2 p-3 w-full", className)}
          {...props}
        >
          <div className="flex flex-col items-start justify-between gap-2 sm:gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-lg sm:text-2xl font-display leading-none">
                {lessonName}
              </span>
              <Tag icon={ClockIcon}>{timeRange}</Tag>
            </div>
            <div className="flex items-center gap-2">
              <UserAvatar user={trainer} size="sm" />
              <span className="text-sm font-medium">{trainer.name}</span>
            </div>
          </div>
          <div className="flex flex-col items-end justify-between gap-4">
            <LevelBadge level={lesson.level} />
            <Tag icon={UsersIcon}>
              {lesson.maxRiders - openSlots}/{lesson.maxRiders}
            </Tag>
          </div>
        </div>
      );
    default:
      return null;
  }
}

function TrailingSlot({ className, ...props }: React.ComponentProps<"div">) {
  const { lesson, perspective, variant } = useLessonCard();

  const openSlots = lesson.maxRiders - (lesson.enrollments?.length ?? 0);
  const isFull = openSlots === 0;

  const rider =
    perspective.kind === "rider" ? getUser({ rider: perspective.rider }) : null;

  switch (variant) {
    case "agenda":
      return null;
    case "compact":
      return (
        <div
          data-slot="trailing-slot"
          className={cn("ml-auto shrink-0 self-center", className)}
          {...props}
        >
          {perspective.kind === "admin" ? (
            <Progress
              value={openSlots}
              max={lesson.maxRiders}
              color={lesson.level?.color}
            />
          ) : (
            rider && (
              <div className="flex items-center gap-1">
                <UserAvatar user={rider} size="xs" />
                <span className="text-xs font-medium">{rider.name}</span>
              </div>
            )
          )}
        </div>
      );
    case "date-chip":
      return (
        <div
          data-slot="trailing-slot"
          className={cn(
            "flex flex-col items-end gap-0.5 text-sm tabular-nums",
            className
          )}
          {...props}
        >
          {perspective.kind === "admin" ? (
            <>
              <span className={cn("font-medium", isFull && "text-destructive")}>
                {isFull ? "Full" : `${openSlots}/${lesson.maxRiders}`}
              </span>
              {!isFull && (
                <span className="text-xs text-muted-foreground">
                  {openSlots} open
                </span>
              )}
            </>
          ) : (
            <Button variant="ghost" size="sm">
              Details
              <ChevronRightIcon />
            </Button>
          )}
        </div>
      );
    default:
      return null;
  }
}

export { LessonCard, LessonCardList };
