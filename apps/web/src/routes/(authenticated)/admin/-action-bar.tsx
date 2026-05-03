import { APIError, useExportUsers, type types } from "@instride/api";
import type { Row, Table } from "@tanstack/react-table";
import { DownloadIcon } from "lucide-react";
import { toast } from "sonner";

import { DataTableActionBar } from "@/shared/components/complex-data-table/action-bar";
import { Button } from "@/shared/components/ui/button";
import { downloadCSV } from "@/shared/lib/utils/export";

export function UsersActionBar({ table }: { table: Table<types.AuthUser> }) {
  const exportUsers = useExportUsers();

  const handleExportSelectedUsers = async (rows: Row<types.AuthUser>[]) => {
    if (rows.length === 0) {
      toast.error("No users selected");
      return;
    }

    const userIds = rows.map((row) => row.original.id);

    try {
      const result = await exportUsers.mutateAsync({ userIds });
      downloadCSV(result.csv, result.filename);
      toast.success("Users exported successfully");
    } catch (error) {
      const message =
        error instanceof APIError ? error.message : "Failed to export users";
      toast.error(message);
    }
  };
  return (
    <DataTableActionBar table={table}>
      {({ rows }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExportSelectedUsers(rows)}
        >
          <DownloadIcon />
          Export as CSV
        </Button>
      )}
    </DataTableActionBar>
  );
}
