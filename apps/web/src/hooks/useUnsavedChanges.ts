import { useEffect, useRef, useCallback } from "react";
import { useBlocker } from "react-router";

/**
 * Guards against accidental data loss during multi-step forms.
 *
 * - **Browser close / refresh / address-bar navigation**: native `beforeunload` dialog
 *   (the only mechanism the browser allows — custom UI is not possible here).
 * - **In-app SPA navigation**: returns a React Router `blocker` so the caller
 *   can render a custom confirmation dialog.
 *
 * Call `allowNavigation()` before a programmatic navigate to bypass the blocker
 * (e.g. after a successful form submission).
 */
export function useUnsavedChanges(dirty: boolean) {
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const bypassRef = useRef(false);

  useEffect(() => {
    if (!dirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const shouldBlock = useCallback(
    () => dirtyRef.current && !bypassRef.current,
    [],
  );

  const blocker = useBlocker(shouldBlock);

  const allowNavigation = useCallback(() => {
    bypassRef.current = true;
  }, []);

  return { blocker, allowNavigation };
}
