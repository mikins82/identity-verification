import { useEffect } from "react";
import { useBlocker } from "react-router";

/**
 * Guards against accidental data loss during multi-step forms.
 *
 * - **Browser close / refresh / address-bar navigation**: native `beforeunload` dialog
 *   (the only mechanism the browser allows — custom UI is not possible here).
 * - **In-app SPA navigation**: returns a React Router `blocker` so the caller
 *   can render a custom confirmation dialog.
 */
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const blocker = useBlocker(dirty);

  return blocker;
}
