import {
  boardsOptions,
  type BoardBusinessHours,
  type BusinessHours,
} from "@instride/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { RotateCcwIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { confirmationModalHandler } from "@/shared/components/confirmation-modal";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardTitle,
  CardDescription,
  CardHeader,
  CardAction,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/shared/components/ui/tabs";
import { useIsMobile } from "@/shared/hooks/use-mobile";

interface BusinessHoursTabsProps {
  defaultsLabel: string;
  defaultsDescription: string;
  availability: {
    defaults: BusinessHours[];
    boardOverrides: Record<string, BoardBusinessHours[]>;
  };
  orgAvailability?: {
    defaults: BusinessHours[];
    boardOverrides: Record<string, BoardBusinessHours[]>;
  };
  onResetBoard: (boardId: string) => Promise<void>;
  children: (props: {
    boardId: string | null;
    effectiveHours: BusinessHours[];
    orgHoursForBoard: BusinessHours[] | undefined;
  }) => React.ReactNode;
}

export function BusinessHoursTabs({
  defaultsLabel,
  defaultsDescription,
  availability,
  orgAvailability,
  onResetBoard,
  children,
}: BusinessHoursTabsProps) {
  const { data: boards } = useSuspenseQuery(boardsOptions.list());
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = React.useState<"defaults" | string>(
    "defaults"
  );

  const selectedBoard = boards.find((board) => board.id === activeTab);
  const isDefaults = activeTab === "defaults";

  const boardHours = selectedBoard
    ? (availability.boardOverrides[selectedBoard.id] ?? [])
    : [];
  const hasOverride = boardHours.length > 0;
  const effectiveHours = isDefaults
    ? availability.defaults
    : hasOverride
      ? boardHours
      : availability.defaults;

  const orgHoursForBoard =
    selectedBoard && orgAvailability
      ? (orgAvailability.boardOverrides[selectedBoard.id]?.length ?? 0) > 0
        ? orgAvailability.boardOverrides[selectedBoard.id]
        : orgAvailability.defaults
      : undefined;

  const handleReset = (boardId: string) => {
    confirmationModalHandler.openWithPayload({
      title: "Reset to organization defaults?",
      description:
        "This will remove the custom hours for this board and fall back to the organization-wide defaults. This cannot be undone.",
      confirmLabel: "Reset",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        await onResetBoard(boardId);
        setActiveTab("defaults");
        toast.success("Board hours reset to organization defaults");
      },
    });
  };

  if (isMobile) {
    return (
      <Card>
        <CardHeader className="gap-3">
          <Select
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as string)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="defaults">{defaultsLabel}</SelectItem>
              {boards.map((board) => {
                const boardHasOverride =
                  (availability.boardOverrides[board.id]?.length ?? 0) > 0;
                return (
                  <SelectItem key={board.id} value={board.id}>
                    <span className="flex items-center gap-2">
                      {board.name}
                      {boardHasOverride && (
                        <Badge variant="secondary" className="text-xs">
                          Custom
                        </Badge>
                      )}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <div>
            <CardTitle>
              {isDefaults ? defaultsLabel : selectedBoard?.name}
            </CardTitle>
            <CardDescription>
              {isDefaults
                ? defaultsDescription
                : hasOverride
                  ? "This board has custom hours."
                  : "Using organization defaults."}
            </CardDescription>
          </div>

          {!isDefaults && hasOverride && selectedBoard && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReset(selectedBoard.id)}
            >
              <RotateCcwIcon className="h-3.5 w-3.5 mr-1.5" />
              Reset to defaults
            </Button>
          )}
        </CardHeader>

        {children({
          boardId: isDefaults ? null : (selectedBoard?.id ?? null),
          effectiveHours,
          orgHoursForBoard,
        })}
      </Card>
    );
  }

  return (
    <Card>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-2"
      >
        <CardHeader>
          <TabsList className="w-full">
            <TabsTrigger value="defaults">{defaultsLabel}</TabsTrigger>
            {boards.map((board) => (
              <TabsTrigger key={board.id} value={board.id}>
                {board.name}
                {availability.boardOverrides[board.id]?.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-xs">
                    Custom
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </CardHeader>
        <TabsContent value="defaults">
          <CardHeader>
            <CardTitle>{defaultsLabel}</CardTitle>
            <CardDescription>{defaultsDescription}</CardDescription>
          </CardHeader>
          {children({
            boardId: null,
            effectiveHours: availability.defaults,
            orgHoursForBoard: orgAvailability?.defaults,
          })}
        </TabsContent>

        {boards.map((board) => {
          const boardHours = availability.boardOverrides[board.id] ?? [];
          const hasOverride = boardHours.length > 0;
          const effectiveHours = hasOverride
            ? boardHours
            : availability.defaults;

          const orgHoursForBoard = orgAvailability
            ? (orgAvailability.boardOverrides[board.id]?.length ?? 0) > 0
              ? orgAvailability.boardOverrides[board.id]
              : orgAvailability.defaults
            : undefined;

          return (
            <TabsContent key={board.id} value={board.id}>
              <CardHeader>
                <CardTitle>{board.name}</CardTitle>
                <CardDescription>
                  {hasOverride
                    ? "This board has custom hours."
                    : "Using organization defaults."}
                </CardDescription>
                {hasOverride && (
                  <CardAction>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        confirmationModalHandler.openWithPayload({
                          title: "Reset to organization defaults?",
                          description:
                            "This will remove the custom hours for this board and fall back to the organization-wide defaults. This cannot be undone.",
                          confirmLabel: "Reset",
                          cancelLabel: "Cancel",
                          onConfirm: async () => {
                            await onResetBoard(board.id);
                            setActiveTab("defaults");
                            toast.success(
                              "Board hours reset to organization defaults"
                            );
                          },
                        })
                      }
                    >
                      <RotateCcwIcon className="h-3.5 w-3.5 mr-1.5" />
                      Reset to defaults
                    </Button>
                  </CardAction>
                )}
              </CardHeader>
              {children({
                boardId: board.id,
                effectiveHours,
                orgHoursForBoard,
              })}
            </TabsContent>
          );
        })}
      </Tabs>
    </Card>
  );
}
