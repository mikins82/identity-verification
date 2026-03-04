import { useState, useEffect } from "react";
import {
  BrowserPermissionAdapter,
  type PermissionState,
} from "@identity-verification/headless";

export type { PermissionState };

export function useMediaPermission(): PermissionState {
  const [state, setState] = useState<PermissionState>(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      return "unavailable";
    }
    return "prompt";
  });

  useEffect(() => {
    const adapter = new BrowserPermissionAdapter();
    let mounted = true;

    adapter.query().then((result) => {
      if (mounted) setState(result);
    });

    const unsub = adapter.subscribe((next) => {
      if (mounted) setState(next);
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  return state;
}
