import { useState, useEffect } from "react";
import { type PermissionState } from "@identity-verification/headless";
import { ReactNativePermissionAdapter } from "@identity-verification/headless/react-native";

export type { PermissionState };

export function useMediaPermission(): PermissionState {
  const [state, setState] = useState<PermissionState>("prompt");

  useEffect(() => {
    const adapter = new ReactNativePermissionAdapter();
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
