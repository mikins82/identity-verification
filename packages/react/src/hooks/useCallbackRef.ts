import { useRef, useEffect, useCallback } from "react";

type CallbackFn = (...args: never[]) => unknown;

/**
 * Returns a stable function reference that always calls the latest version
 * of the provided callback. Prevents stale closure issues when callbacks
 * are used inside effects or event handlers that outlive a render cycle.
 */
export function useCallbackRef<T extends CallbackFn>(callback: T): T {
  const ref = useRef<T>(callback);

  useEffect(() => {
    ref.current = callback;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    ((...args: Parameters<T>) => ref.current(...args)) as unknown as T,
    [],
  );
}
