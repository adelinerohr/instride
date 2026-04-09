import * as React from "react";

export function useHotKey(
  callback: () => void,
  key: string,
  options?: { shift?: boolean }
): void {
  // Use ref to always have the latest callback without re-registering the listener
  const callbackRef = React.useRef(callback);
  // eslint-disable-next-line react-hooks/refs
  callbackRef.current = callback;

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const shiftMatch = options?.shift ? e.shiftKey : true;

      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        (e.metaKey || e.ctrlKey) &&
        shiftMatch
      ) {
        callbackRef.current();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, options?.shift]);
}
