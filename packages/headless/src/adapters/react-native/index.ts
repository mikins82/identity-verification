export { ReactNativeCameraAdapter, capturePhoto } from "./reactNativeCamera";
export type { ReactNativeCameraStream } from "./reactNativeCamera";
export { ReactNativePermissionAdapter } from "./reactNativePermission";
export { ReactNativeLocaleAdapter } from "./reactNativeLocale";

import type { CameraAdapter } from "../camera";
import type { PermissionAdapter } from "../permission";
import type { LocaleAdapter } from "../locale";
import { ReactNativeCameraAdapter } from "./reactNativeCamera";
import type { ReactNativeCameraStream } from "./reactNativeCamera";
import { ReactNativePermissionAdapter } from "./reactNativePermission";
import { ReactNativeLocaleAdapter } from "./reactNativeLocale";

export interface ReactNativeAdapters {
  camera: CameraAdapter<ReactNativeCameraStream>;
  permission: PermissionAdapter;
  locale: LocaleAdapter;
}

export function createReactNativeAdapters(): ReactNativeAdapters {
  return {
    camera: new ReactNativeCameraAdapter(),
    permission: new ReactNativePermissionAdapter(),
    locale: new ReactNativeLocaleAdapter(),
  };
}
