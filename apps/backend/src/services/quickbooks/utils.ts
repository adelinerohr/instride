import { QuickBooksErrorResponse } from "./types/models";

export function isQuickBooksError(
  data: unknown
): data is QuickBooksErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "Fault" in data &&
    typeof (data as any).Fault === "object"
  );
}
