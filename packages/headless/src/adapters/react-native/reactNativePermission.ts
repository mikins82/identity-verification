declare const require: (id: string) => unknown;

import type { PermissionAdapter, PermissionState } from "../permission";

type VisionCameraPermission = "granted" | "denied" | "not-determined" | "restricted";

interface VisionCameraStatic {
  getCameraPermissionStatus(): VisionCameraPermission;
  requestCameraPermission(): Promise<VisionCameraPermission>;
}

interface AppStateModule {
  addEventListener(type: string, handler: (state: string) => void): { remove(): void };
}

let Camera: VisionCameraStatic | undefined;
let AppState: AppStateModule | undefined;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Camera = require("react-native-vision-camera") as VisionCameraStatic;
} catch {
  /* optional peer dep */
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  AppState = (require("react-native") as { AppState: AppStateModule }).AppState;
} catch {
  /* optional dep */
}

function mapPermission(status: VisionCameraPermission): PermissionState {
  switch (status) {
    case "granted":
      return "granted";
    case "denied":
    case "restricted":
      return "denied";
    case "not-determined":
      return "prompt";
    default:
      return "unavailable";
  }
}

export class ReactNativePermissionAdapter implements PermissionAdapter {
  async query(): Promise<PermissionState> {
    if (!Camera) return "unavailable";

    try {
      const status = Camera.getCameraPermissionStatus();
      if (status === "not-determined") {
        const result = await Camera.requestCameraPermission();
        return mapPermission(result);
      }
      return mapPermission(status);
    } catch {
      return "unavailable";
    }
  }

  subscribe(cb: (state: PermissionState) => void): () => void {
    if (!Camera || !AppState) return () => {};

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && Camera) {
        const status = Camera.getCameraPermissionStatus();
        cb(mapPermission(status));
      }
    });

    return () => subscription.remove();
  }
}
