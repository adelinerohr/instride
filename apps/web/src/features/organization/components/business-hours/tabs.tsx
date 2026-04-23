import { boardsOptions, type types } from "@instride/api";
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/shared/components/ui/tabs";

interface BusinessHoursTabsProps {
  defaultsLabel: string;
  defaultsDescription: string;
  availability: {
    defaults: types.BusinessHours[];
    boardOverrides: Record<string, types.BoardBusinessHours[]>;
  };
  orgAvailability?: {
    defaults: types.BusinessHours[];
    boardOverrides: Record<string, types.BoardBusinessHours[]>;
  };
  onResetBoard: (boardId: string) => void;
  children: (props: {
    boardId: string | null;
    effectiveHours: types.BusinessHours[];
    orgHoursForBoard: types.BusinessHours[] | undefined;
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
  const [activeTab, setActiveTab] = React.useState<"defaults" | string>(
    "defaults"
  );

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
