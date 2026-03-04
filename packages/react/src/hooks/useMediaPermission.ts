import { useState, useEffect } from "react";

export type PermissionState = "prompt" | "granted" | "denied" | "unavailable";

export function useMediaPermission(): PermissionState {
  const [state, setState] = useState<PermissionState>(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      return "unavailable";
    }
    return "prompt";
  });

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions) return;

    let mounted = true;
    let removeListener: (() => void) | undefined;

    navigator.permissions
      .query({ name: "camera" as PermissionName })
      .then((status) => {
        if (!mounted) return;
        setState(status.state as PermissionState);

        const onChange = () => {
          if (mounted) setState(status.state as PermissionState);
        };
        status.addEventListener("change", onChange);
        removeListener = () => status.removeEventListener("change", onChange);
      })
      .catch(() => {
        /* permissions.query for camera not supported in all browsers */
      });

    return () => {
      mounted = false;
      removeListener?.();
    };
  }, []);

  return state;
}
