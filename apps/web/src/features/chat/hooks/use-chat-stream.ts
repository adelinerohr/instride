import { connectChatStream } from "@instride/api";
import * as React from "react";

export function useChatStream() {
  React.useEffect(() => {
    const handle = connectChatStream();

    return () => handle.disconnect();
  }, []);
}
